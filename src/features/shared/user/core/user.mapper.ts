import { singleton } from 'tsyringe';

// DTO
import {
  UserProfileResponseDto,
  UserClientResponseDto,
  UserClientSummaryResponseDto,
} from 'features/client/user/core/user.client.dto';
import {
  UserManagementResponseDto,
  UserManagementSummaryResponseDto,
} from 'features/management/user/core/user.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import type {
  IUserEntity,
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/core/user.types';

export type IUserMapper = InstanceType<typeof UserMapper>;

@singleton()
export class UserMapper extends BaseMapper<
  IUserEntity,
  UserClientResponseDto,
  UserManagementResponseDto,
  UserClientSummaryResponseDto,
  UserManagementSummaryResponseDto
> {
  constructor() {
    super(
      UserClientResponseDto,
      UserManagementResponseDto,
      UserClientSummaryResponseDto,
      UserManagementSummaryResponseDto
    );
  }
  public toProfileDto(
    entity: UserDocument | UserLeanDocument
  ): UserProfileResponseDto {
    return this.toInstance(UserProfileResponseDto, entity);
  }
}
