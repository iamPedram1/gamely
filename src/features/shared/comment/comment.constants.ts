import {
  CommentStatusType,
  CommentType,
} from 'features/shared/comment/comment.type';

export const commentType: CommentType[] = ['main', 'reply'];
export const commentStatus: CommentStatusType[] = [
  'approved',
  'pending',
  'rejected',
];
