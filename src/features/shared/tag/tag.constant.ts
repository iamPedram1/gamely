import { container } from 'tsyringe';
import TagService from 'features/shared/tag/tag.service';

export const generateTagService = () => container.resolve(TagService);
