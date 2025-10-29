import { singleton } from 'tsyringe';
import { plainToInstance } from 'class-transformer';

// DTO
import {
  UserFollowerResponseDto,
  UserFollowingResponseDto,
} from 'features/shared/userFollow/userFollow.dto';

// Types
import { UserFollowLeanDocument } from 'features/shared/userFollow/userFollow.types';

export type IUserFollowMapper = InstanceType<typeof UserFollowMapper>;

@singleton()
export class UserFollowMapper {
  toFollowerDto(doc: UserFollowLeanDocument) {
    return plainToInstance(UserFollowerResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
  toFollowingDto(doc: UserFollowLeanDocument) {
    return plainToInstance(UserFollowingResponseDto, doc, {
      excludeExtraneousValues: true,
    });
  }
}
