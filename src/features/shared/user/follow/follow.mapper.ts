import { singleton } from 'tsyringe';

// DTO
import { AbstractMapper } from 'core/mappers/base';
import {
  FollowerResponseDto,
  FollowingResponseDto,
} from 'features/shared/user/follow/follow.dto';

// Types
import {
  FollowDocument,
  FollowLeanDocument,
} from 'features/shared/user/follow/follow.types';

export type IFollowMapper = InstanceType<typeof FollowMapper>;

@singleton()
export class FollowMapper extends AbstractMapper<
  FollowDocument,
  FollowLeanDocument
> {
  toFollowerDto(doc: FollowLeanDocument) {
    return this.toInstance(FollowerResponseDto, doc);
  }
  toFollowingDto(doc: FollowLeanDocument) {
    return this.toInstance(FollowingResponseDto, doc);
  }
}
