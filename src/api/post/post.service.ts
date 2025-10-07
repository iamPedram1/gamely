import { DeleteResult } from 'mongoose';

// Models
import Post from 'api/post/post.model';

// Dto
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';

// Services
import BaseService, { IBaseService } from 'services/base';

// Utilities
import { ValidationError } from 'utilites/errors';

// Types
import type { IPostEntity } from 'api/post/post.type';
import type { ITagService } from 'api/tag/tag.service';
import type { IGameService } from 'api/game/game.service';
import type { ICategoryService } from 'api/category/category.service';
import type { PostDocument, PostLeanDocument } from 'api/post/post.model';

export interface IPostService extends IBaseService<PostLeanDocument> {
  update: (postId: string, data: UpdatePostDto) => Promise<PostDocument | null>;
  create: (data: CreatePostDto, userId: string) => Promise<PostDocument>;
}

class PostService extends BaseService<IPostEntity> {
  private tagService: ITagService;
  private gameService: IGameService;
  private categoryService: ICategoryService;

  constructor(
    tagService: ITagService,
    gameService: IGameService,
    categoryService: ICategoryService
  ) {
    super(Post);
    this.tagService = tagService;
    this.gameService = gameService;
    this.categoryService = categoryService;
  }

  private async validateCategory(category: string) {
    const exist = await this.categoryService.checkExistenceById(category);
    if (exist) return;
    else throw new ValidationError('Category with given id does not exist');
  }

  private async validateGame(game: string) {
    if (!game) return;
    const exist = await this.gameService.checkExistenceById(game);
    if (!exist) throw new ValidationError('Game with given id does not exist');
  }

  private async validateTags(tags: string[]) {
    if (!tags || tags.length === 0) return;

    for (let tag of tags as string[]) {
      const exist = await this.tagService.checkExistenceById(tag);
      if (!exist)
        throw new ValidationError(`Tag with given id: (${tag}) does not exist`);
    }
  }

  async create(data: CreatePostDto, userId: string): Promise<PostDocument> {
    await Promise.all([
      this.validateGame(data.game as string),
      this.validateTags(data.tags as string[]),
      this.validateCategory(data.category as string),
    ]);

    const newPost = await new Post({ ...data, creator: userId }).save();

    if (!newPost) throw new ValidationError('Post could not be created');

    return newPost;
  }

  async delete(postId: string): Promise<DeleteResult> {
    const deleted = await Post.deleteOne({ _id: postId });

    return deleted;
  }

  async update(postId: string, payload: UpdatePostDto) {
    await Promise.all([
      ...(payload.game ? [this.validateGame(payload.game as string)] : []),
      ...(payload.tags ? [this.validateTags(payload.tags as string[])] : []),
      ...(payload.category
        ? [this.validateCategory(payload.category as string)]
        : []),
    ]);

    return await Post.findByIdAndUpdate(
      postId,
      { ...payload, updatedAt: Date.now() },
      { new: true }
    )
      .populate('creator', 'name email')
      .exec();
  }
}

export default PostService;
