import { container } from 'tsyringe';
import PostService from 'features/shared/post/core/post.service';

export const postPopulate = [
  { path: 'creator', populate: 'avatar' },
  { path: 'category' },
  { path: 'game' },
  { path: 'tags' },
  { path: 'coverImage' },
];

export const generatePostService = () => container.resolve(PostService);
