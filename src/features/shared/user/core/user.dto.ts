import { IsMongoId, IsOptional, Length } from 'core/utilities/validation';

// DTO

// Types
import type { Types } from 'mongoose';

export abstract class BaseUserUpdate {
  @IsOptional()
  @Length(3, 255)
  abstract username: string;

  @IsOptional()
  @Length(1, 255)
  abstract bio: string;

  @IsOptional()
  @IsMongoId()
  abstract avatar: Types.ObjectId;
}
