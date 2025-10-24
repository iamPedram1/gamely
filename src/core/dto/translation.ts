import { Transform, Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';

export function createTranslationsWrapper<
  T extends new (...args: any[]) => any,
>(Cls: T) {
  class TranslationsWrapper {
    @IsObject()
    @ValidateNested()
    @Type(() => Cls)
    @Transform(({ value }) => value || {})
    en: InstanceType<T>;

    @IsObject()
    @ValidateNested()
    @Type(() => Cls)
    @Transform(({ value }) => value || {})
    fa: InstanceType<T>;
  }

  return TranslationsWrapper;
}
