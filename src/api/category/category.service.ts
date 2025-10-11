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
import BaseService from 'services/base.service.module';

// Utilities
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from 'utilites/errors';

// Types
import { IBaseService } from 'services/base.service.type';
import type { IPostService } from 'api/post/post.service';
import type { CategoryDocument } from 'api/category/category.model';
import type {
  ICategoryEntity,
  INestedCategory,
} from 'api/category/category.type';

export interface ICategoryService
  extends IBaseService<ICategoryEntity, CreateCategoryDto, UpdateCategoryDto> {
  getAllNested(): Promise<INestedCategory[]>;
}

type ParentMap = Record<string, number[]>;

interface Dependencies {
  postService: IPostService;
}
class CategoryService
  extends BaseService<ICategoryEntity, CreateCategoryDto, UpdateCategoryDto>
  implements ICategoryService
{
  private postService: IPostService;

  constructor() {
    super(Category);
  }

  setDependencies({ postService }: Dependencies) {
    this.postService = postService;
  }

  async create(data: CreateCategoryDto) {
    if (data.parentId) {
      const parentExists = await super.existsBySlug(data.parentId);
      if (!parentExists)
        throw new NotFoundError(
          'Category with the provided categoryId does not exist'
        );
    }
    return await super.create(data);
  }

  async updateOneById(categoryId: string, payload: UpdateCategoryDto) {
    const [category, descendants] = await Promise.all([
      this.getOneById(categoryId) as Promise<CategoryDocument>,
      this.getAllDescendantIds(categoryId),
    ]);

    const isIdChanged =
      'parentId' in payload
        ? (String(category.parentId || '') || null) !== payload.parentId
        : false;

    if (isIdChanged && descendants.includes(payload.parentId))
      throw new BadRequestError('parentId: Circular relationship detected');

    if (payload.parentId === categoryId)
      throw new BadRequestError(
        'parentId: A category cannot be its own parent.'
      );

    if (payload.title) category.set('title', payload.title);
    if (payload.slug) category.set('slug', payload.slug);
    if (payload.parentId) category.set('parentId', payload.parentId);

    return await category.save();
  }

  async deleteOneById(id: string): Promise<DeleteResult> {
    return this.withTransaction(async (session) => {
      await this.removeChildrens(id, session);
      await this.postService.deleteManyByKey('category', id, { session });
      const deleteResult = await super.deleteOneById(id);
      if (deleteResult.deletedCount === 0)
        throw new InternalServerError('Service was unable to delete category.');

      return deleteResult;
    });
  }

  async getAllNested() {
    const categories = (await super.find({
      lean: true,
      paginate: false,
    })) as unknown as INestedCategory[];

    const parentMap: Record<string, number[]> = {};

    // Build Parent Map and Initialize Data
    categories.forEach((category, index) => {
      category.children = [];
      const parentId = category.parentId ? String(category.parentId) : null;

      if (!parentId) return;

      if (!parentMap[parentId]) parentMap[parentId] = [];
      parentMap[parentId].push(index);
    });

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

  private async getAllDescendantIds(id: string): Promise<string[]> {
    const categories = await super.find({ paginate: false, lean: true });
    const map: Record<string, string[]> = {};

    for (const cat of categories) {
      if (!cat.parentId) continue;
      const pid = String(cat.parentId);
      if (!map[pid]) map[pid] = [];
      map[pid].push(String(cat._id));
    }

    const stack = [id];
    const descendants = new Set<string>();

    while (stack.length) {
      const current = stack.pop()!;
      const children = map[current] || [];
      children.forEach((c) => {
        if (!descendants.has(c)) {
          descendants.add(c);
          stack.push(c);
        }
      });
    }
    return Array.from(descendants);
  }

  private getChildren(
    category: INestedCategory,
    categories: INestedCategory[],
    parentMap: ParentMap
  ) {
    const id = category?._id ? String(category._id) : '';
    return (id ? parentMap?.[id] || [] : []).map((index) => {
      const category = categories[index];
      const parentId = category.parentId ? String(category.parentId) : null;
      if (parentId)
        category.children = this.getChildren(category, categories, parentMap);
      return category;
    });
  }

  private async removeChildrens(id: string, session: ClientSession) {
    const children = await Category.find({ parentId: id }).session(session);

    for (const child of children) {
      await this.removeChildrens(String(child._id), session);
    }

    return Category.deleteMany({ parentId: id }).session(session);
  }
}

export default CategoryService;

//
