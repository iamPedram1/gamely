import { Transform, Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'core/utilities/validation';

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

export function IsTranslationsField<T>(translationClass: new () => T) {
  return function (target: any, propertyKey: string) {
    IsObject()(target, propertyKey);
    ValidateNested()(target, propertyKey);
    Type(() => translationClass)(target, propertyKey);
    Transform(({ value }) => value || {})(target, propertyKey);
  };
}
