import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

// DTO

// Types
import { BlockResponseDto } from 'features/shared/block/block.dto';
import { BlockLeanDocument } from 'features/shared/block/block.types';

export type IBlockMapper = InstanceType<typeof BlockMapper>;

@singleton()
export class BlockMapper {
  toUserBlockDto(doc: BlockLeanDocument) {
    return plainToInstance(BlockResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}
