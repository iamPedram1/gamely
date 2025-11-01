import { Types } from 'mongoose';

export type ModelKeys =
  | 'Post'
  | 'Tag'
  | 'Game'
  | 'User'
  | 'Category'
  | 'File'
  | 'Notification'
  | 'Comment'
  | 'FavoriteGame'
  | 'GameReview'
  | 'Block'
  | 'Follow';

export type DocumentId = string | Types.ObjectId;
