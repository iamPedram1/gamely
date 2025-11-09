import CommentService from 'features/shared/post/comment/comment.service';
import { CommentType } from 'features/shared/post/comment/comment.types';
import { container } from 'tsyringe';

export const commentPopulate = [];
export const commentType: CommentType[] = ['main', 'reply'];
export const generateCommentService = () => container.resolve(CommentService);
