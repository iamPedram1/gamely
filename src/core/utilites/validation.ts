import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isString,
} from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 255;

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!isString(value)) {
            return false;
          }

          if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
            return false;
          }

          return SLUG_PATTERN.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;

          if (!isString(value)) {
            return 'slug must be a string';
          }

          if (value.length < MIN_LENGTH) {
            return `slug must be at least ${MIN_LENGTH} characters long`;
          }

          if (value.length > MAX_LENGTH) {
            return `slug must be at most ${MAX_LENGTH} characters long`;
          }

          return 'slug is not valid (must contain only lowercase letters, numbers, and hyphens)';
        },
      },
    });
  };
}
