import mongoose from 'mongoose';
import type { ClientSession, DeleteResult } from 'mongoose';

// Models
import Category from 'api/category/category.model';

// Dto
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'api/category/category.dto';

// Services
import BaseService, { IBaseService } from 'services/base';

// Utilities
import { ValidationError } from 'utilites/errors';

// Types
import type {
  ICategoryEntity,
  INestedCategory,
} from 'api/category/category.type';
import type {
  CategoryDocument,
  CategoryLeanDocument,
} from 'api/category/category.model';

export interface ICategoryService
  extends IBaseService<CategoryLeanDocument, CategoryDocument> {
  getAllNested(): Promise<INestedCategory[]>;
  getChildrenCount(id: string): Promise<number>;
  getAllDescendantIds(id: string): Promise<string[]>;
  removeChildrens(id: string, session: ClientSession): Promise<DeleteResult>;
  create(data: CreateCategoryDto, userId: string): Promise<CategoryDocument>;
  update(
    categoryId: string,
    data: UpdateCategoryDto
  ): Promise<CategoryDocument | null>;
}

type ParentMap = Record<string, number[]>;

class CategoryService
  extends BaseService<ICategoryEntity, CategoryDocument, CategoryLeanDocument>
  implements ICategoryService
{
  constructor() {
    super(Category);
  }

  async create(data: CreateCategoryDto, userId: string) {
    if (data.parentId) {
      const parentExists = await this.checkExistenceById(data.parentId);
      if (!parentExists)
        throw new ValidationError(
          'Category with the provided categoryId does not exists'
        );
    }
    return (await Category.create({
      ...data,
      creator: userId,
    })) as CategoryDocument;
  }

  async update(categoryId: string, payload: UpdateCategoryDto) {
    const category = (await Category.findOne({
      _id: categoryId,
    })) as CategoryDocument;
    const descendants = await this.getAllDescendantIds(categoryId);
    const isIdChanged =
      'parentId' in payload ? category.parentId !== payload.parentId : false;

    if (isIdChanged && descendants.includes(payload.parentId))
      throw new ValidationError(
        'Invalid parentId: circular relationship detected'
      );

    if (payload.title) category.set('title', payload.title);
    if (payload.slug) category.set('slug', payload.slug);
    if (payload.parentId) category.set('parentId', payload.parentId);

    await category.save();
    return category;
  }

  async deleteById(id: string): Promise<DeleteResult> {
    const session = await mongoose.startSession();
    let deleteResult: DeleteResult = { acknowledged: false, deletedCount: 0 };
    try {
      await session.withTransaction(async () => {
        deleteResult = await super.deleteById(id);
        const deleted = deleteResult.deletedCount > 0;
        if (!deleted)
          throw new ValidationError('Service was unable to delete category.');

        await this.removeChildrens(id, session);
      });

      return deleteResult;
    } catch (error) {
      throw new ValidationError(error.message);
    } finally {
      session.endSession();
    }
  }

  async getAllDescendantIds(id: string): Promise<string[]> {
    const categories = await Category.find().lean();
    const map: Record<string, string[]> = {};

    for (const cat of categories) {
      if (!cat.parentId) continue;
      const pid = String(cat.parentId);
      if (!map[pid]) map[pid] = [];
      map[pid].push(String(cat._id));
    }

    const descendants: string[] = [];
    const stack = [id];

    while (stack.length) {
      const current = stack.pop()!;
      const children = map[current] || [];
      descendants.push(...children);
      stack.push(...children);
    }

    return descendants;
  }

  async removeChildrens(id: string, session: ClientSession) {
    const children = await Category.find({ parentId: id }).session(session);

    for (const child of children) {
      await this.removeChildrens(String(child._id), session);
    }

    return Category.deleteMany({ parentId: id }).session(session);
  }

  async getChildrenCount(id: string) {
    return await Category.countDocuments({ parentId: id });
  }

  private getChildren(
    category: INestedCategory,
    categories: INestedCategory[],
    parentMap: ParentMap
  ) {
    return (category?._id ? parentMap?.[String(category._id)] || [] : []).map(
      (index) => {
        const category = categories[index];
        const parentId = category.parentId ? String(category.parentId) : null;
        if (parentId)
          category.children = this.getChildren(category, categories, parentMap);
        return category;
      }
    );
  }

  async getAllNested() {
    const categories =
      (await Category.find().lean()) as unknown as INestedCategory[];

    const parentMap: Record<string, number[]> = {};

    // Build Parent Map and Initialize Data
    for (let i = 0; i < categories.length; i++) {
      categories[i].children = [];
      const category = categories[i];
      const parentId = category.parentId ? String(category.parentId) : null;

      if (!parentId) continue;

      if (parentMap[parentId]) parentMap[parentId as string].push(i);
      else parentMap[parentId] = [i];
    }

    // Append Childrens to Parent
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].parentId) continue;

      categories[i].children = this.getChildren(
        categories[i],
        categories,
        parentMap
      );
    }

    // Remove Every Categories expect First Level.
    return categories.filter((ctg) => !ctg.parentId);
  }
}

export default CategoryService;

//
