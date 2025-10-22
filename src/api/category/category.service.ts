import type { ClientSession } from 'mongoose';
import { delay, inject, injectable } from 'tsyringe';

// Models
import Category from 'api/category/category.model';

// Dto
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'api/category/category.dto';

// Services
import PostService from 'api/post/post.service';
import BaseService from 'core/services/base/base.service';

// Utilities
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from 'core/utilites/errors';

// Types
import type { BaseMutateOptions } from 'core/types/base.service.type';
import type { CategoryDocument } from 'api/category/category.model';
import type {
  ICategoryEntity,
  INestedCategoryEntity,
} from 'api/category/category.type';

type ParentMap = Record<string, number[]>;

export type ICategoryService = InstanceType<typeof CategoryService>;
@injectable()
class CategoryService extends BaseService<
  ICategoryEntity,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  constructor(
    @inject(delay(() => PostService)) private postService: PostService
  ) {
    super(Category);
  }

  async create(
    data: CreateCategoryDto,
    userId?: string,
    options?: BaseMutateOptions
  ): Promise<CategoryDocument> {
    if (data.parentId) {
      const exists = await super.existsBySlug(data.parentId);
      if (!exists)
        throw new NotFoundError(
          this.t('error.not_exists_by_id', { id: data.parentId })
        );
    }
    return await super.create(data, userId, options);
  }

  async updateOneById(
    id: string,
    payload: Partial<UpdateCategoryDto>,
    options?: BaseMutateOptions
  ): Promise<CategoryDocument> {
    await this.assertOwnership(id);

    const [category, descendants] = await Promise.all([
      this.getOneById(id),
      this.getAllDescendantIds(id),
    ]);

    const isIdChanged =
      'parentId' in payload
        ? (String(category.parentId) || null) !== payload.parentId
        : false;

    if (isIdChanged && descendants.includes(payload.parentId as string))
      throw new BadRequestError(this.t('error.category.circular_relationship'));

    if (payload.parentId === id)
      throw new BadRequestError(this.t('error.category.self_parent'));

    if (payload.title) category.set('title', payload.title);
    if (payload.slug) category.set('slug', payload.slug);
    if (payload.parentId) category.set('parentId', payload.parentId);

    return await category.save({ session: options?.session });
  }

  async deleteOneById<TThrowError extends boolean = true>(
    id: string,
    options?: BaseMutateOptions & { throwError?: TThrowError }
  ): Promise<TThrowError extends true ? true : boolean> {
    return this.withTransaction(async (session) => {
      await this.assertOwnership(id);

      if (this.currentUser.isNot('admin')) {
        const childrenIds = await this.getAllDescendantIds(id);
        const ownsAllChildren =
          (await Category.countDocuments({
            _id: { $in: childrenIds },
            creator: this.currentUser.id,
          })) === childrenIds.length;

        if (!ownsAllChildren)
          throw new ValidationError(this.t('error.own_every_children_error'));
      }

      const [deleted] = await Promise.all([
        super.deleteOneById(id, { ...options, session }),
        this.removeChildrens(id, session),
        this.postService.deleteManyByKey('category', id, { session }),
      ]);

      return deleted;
    });
  }

  async getAllNested() {
    const categories = (await super.find({
      lean: true,
      paginate: false,
    })) as unknown as INestedCategoryEntity[];

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
    category: INestedCategoryEntity,
    categories: INestedCategoryEntity[],
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
    const children = await Category.find({ parentId: id });

    for (const child of children) {
      await this.removeChildrens(String(child._id), session);
    }

    return Category.deleteMany({ parentId: id }).session(session);
  }
}

export default CategoryService;

//
