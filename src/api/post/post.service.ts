import { DeleteResult } from 'mongoose';

// Models
import Post from 'api/post/post.model';

// Dto
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';

// Services
import BaseService from 'services/base.service.module';
import { ICommentService } from 'api/comment/comment.service';

// Types
import type { IPostEntity } from 'api/post/post.type';
import type { PostDocument } from 'api/post/post.model';
import type { PostValidation } from 'api/post/post.validation';

export type IPostService = InstanceType<typeof PostService>;

interface Dependencies {
  postValidation: PostValidation;
  commentService: ICommentService;
}

class PostService extends BaseService<
  IPostEntity,
  CreatePostDto,
  UpdatePostDto
> {
  postValidation: PostValidation;
  commentService: ICommentService;

  constructor() {
    super(Post);
  }

  setDependencies({ postValidation, commentService }: Dependencies) {
    this.postValidation = postValidation;
    this.commentService = commentService;
  }

  async getPostsBy(
    keyName: keyof IPostEntity,
    value: IPostEntity[typeof keyName]
  ): Promise<PostDocument[]> {
    return await super.find({
      filter: { [keyName]: value },
      lean: true,
      paginate: false,
    });
  }

  async create(data: CreatePostDto, userId?: string): Promise<PostDocument> {
    await Promise.all([
      this.postValidation.validateGame(data.game),
      this.postValidation.validateTags(data.tags),
      this.postValidation.validateCategory(data.category),
    ]);

    return await super.create(data, userId);
  }

  async updateOneById(id: string, payload: UpdatePostDto) {
    await Promise.all([
      ...(payload.game ? [this.postValidation.validateGame(payload.game)] : []),
      ...(payload.tags ? [this.postValidation.validateTags(payload.tags)] : []),
      ...(payload.category
        ? [this.postValidation.validateCategory(payload.category)]
        : []),
    ]);

    return await super.updateOneById(id, payload);
  }

  async deleteOneById(id: string): Promise<DeleteResult> {
    return this.withTransaction(async (session) => {
      await this.commentService.deleteManyByKey('postId', id, { session });

      return super.deleteOneById(id, { session });
    });
  }
}

export default PostService;
