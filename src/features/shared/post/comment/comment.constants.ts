import {
  CommentStatusType,
  CommentType,
} from 'features/shared/post/comment/comment.types';

export const commentPopulate = [];
export const commentType: CommentType[] = ['main', 'reply'];
export const commentStatus: CommentStatusType[] = [
  'approved',
  'pending',
  'rejected',
];
