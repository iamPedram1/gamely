import { Transform, Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';

export function createTranslationsWrapper<
  T extends new (...args: any[]) => any,
>(Cls: T) {
  const decorators = [
    IsObject(),
    ValidateNested(),
    Type(() => Cls),
    Transform(({ value }) => value || {}),
  ];

  class TranslationsWrapper {
    en: InstanceType<T>;
    fa: InstanceType<T>;
  }

  ['en', 'fa'].forEach((lang) => {
    decorators.forEach((decorator) => {
      decorator(TranslationsWrapper.prototype, lang);
    });
  });

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
