import { singleton } from 'tsyringe';

// DTO
import { BlockResponseDto } from 'features/shared/user/block/block.dto';
import { AbstractMapper } from 'core/mappers/base';

// Types
import {
  BlockDocument,
  BlockLeanDocument,
} from 'features/shared/user/block/block.types';

export type IBlockMapper = InstanceType<typeof BlockMapper>;

@singleton()
export class BlockMapper extends AbstractMapper<
  BlockDocument,
  BlockLeanDocument
> {
  toUserBlockDto(doc: BlockLeanDocument) {
    return this.toInstance(BlockResponseDto, doc);
  }
}
