import { singleton } from 'tsyringe';

// Mapper
import { AbstractMapper } from 'core/mappers/base';

// Types
import { BanResponseDto } from 'features/management/user/ban/ban.dto';
import {
  BanDocument,
  BanLeanDocument,
} from 'features/management/user/ban/ban.types';

export type IUserBanMapper = InstanceType<typeof UserBanMapper>;

@singleton()
export class UserBanMapper extends AbstractMapper<
  BanDocument,
  BanLeanDocument
> {
  toUserBanDto(doc: BanLeanDocument) {
    return this.toInstance(BanResponseDto, doc);
  }
}
