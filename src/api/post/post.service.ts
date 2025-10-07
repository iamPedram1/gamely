// Models
import Post from 'api/post/post.model';

// Dto
import { CreatePostDto, UpdatePostDto } from 'api/post/post.dto';

// Services
import BaseService, { IBaseService } from 'services/base';

// Types
import type { IPostEntity } from 'api/post/post.type';
import type { PostDocument } from 'api/post/post.model';
import type { PostValidation } from 'api/post/post.validation';

export interface IPostService
  extends IBaseService<IPostEntity, CreatePostDto, UpdatePostDto> {
  getPostsByTag: (tagId: string) => Promise<PostDocument[]>;
  getPostsByGame: (gameId: string) => Promise<PostDocument[]>;
  getPostsByCategory: (categoryId: string) => Promise<PostDocument[]>;
}

interface Dependencies {
  postValidation: PostValidation;
}

class PostService
  extends BaseService<IPostEntity, CreatePostDto, UpdatePostDto>
  implements IPostService
{
  postValidation: PostValidation;

  constructor() {
    super(Post);
  }

  setDependencies({ postValidation }: Dependencies) {
    this.postValidation = postValidation;
  }

  async getPostsByGame(gameId: string): Promise<PostDocument[]> {
    return await Post.find({ game: gameId });
  }

  async getPostsByCategory(categoryId: string): Promise<PostDocument[]> {
    return await Post.find({ category: categoryId });
  }

  async getPostsByTag(tagId: string): Promise<PostDocument[]> {
    return await Post.find({ tags: { $in: [tagId] } });
  }

  async create(data: CreatePostDto): Promise<PostDocument> {
    await Promise.all([
      this.postValidation.validateGame(data.game as string),
      this.postValidation.validateTags(data.tags as string[]),
      this.postValidation.validateCategory(data.category as string),
    ]);

    return await super.create(data);
  }

  async update(id: string, payload: UpdatePostDto) {
    await Promise.all([
      ...(payload.game
        ? [this.postValidation.validateGame(payload.game as string)]
        : []),
      ...(payload.tags
        ? [this.postValidation.validateTags(payload.tags as string[])]
        : []),
      ...(payload.category
        ? [this.postValidation.validateCategory(payload.category as string)]
        : []),
    ]);

    return await super.update(id, payload);
  }
}

export default PostService;
