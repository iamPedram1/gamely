import { IsMongoId, IsOptional, Length } from 'core/utilities/validation';

// DTO

// Types
import type { Types } from 'mongoose';

export abstract class BaseUserUpdate {
  @IsOptional()
  @Length(3, 255)
  abstract name: string;

  @IsOptional()
  @Length(1, 255)
  abstract bio: string;

  @IsOptional()
  @Length(8, 255)
  abstract password: string;

  @IsOptional()
  @IsMongoId()
  abstract avatar: Types.ObjectId;
}
