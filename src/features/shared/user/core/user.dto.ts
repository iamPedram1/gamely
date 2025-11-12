import {
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'core/utilities/validation';

// Types
import type { Types } from 'mongoose';

export abstract class BaseUserUpdate {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  abstract username: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  abstract name: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  abstract bio: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  abstract avatar: Types.ObjectId;
}
