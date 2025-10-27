import { singleton } from 'tsyringe';

// DTO
import {
  UserProfileResponseDto,
  UserClientResponseDto,
  UserClientSummaryResponseDto,
} from 'features/client/user/user.client.dto';
import {
  UserManagementResponseDto,
  UserManagementSummaryResponseDto,
} from 'features/management/user/user.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import type {
  UserDocument,
  UserLeanDocument,
} from 'features/shared/user/user.types';
import { plainToInstance } from 'class-transformer';

export type IUserMapper = InstanceType<typeof UserMapper>;

@singleton()
export class UserMapper extends BaseMapper<
  UserDocument,
  UserLeanDocument,
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
    return plainToInstance(UserProfileResponseDto, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }
}
