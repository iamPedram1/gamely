import { container } from 'tsyringe';
import BlockService from 'features/shared/user/block/block.service';

export const generateBlockService = () => container.resolve(BlockService);
