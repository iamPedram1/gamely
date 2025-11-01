import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

// DTO
import {
  FollowerResponseDto,
  FollowingResponseDto,
} from 'features/shared/user/follow/follow.dto';

// Types
import { FollowLeanDocument } from 'features/shared/user/follow/follow.types';

export type IFollowMapper = InstanceType<typeof FollowMapper>;

@singleton()
export class FollowMapper {
  toFollowerDto(doc: FollowLeanDocument) {
    return plainToInstance(FollowerResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
  toFollowingDto(doc: FollowLeanDocument) {
    return plainToInstance(FollowingResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}
