import type { CountryCode } from 'libphonenumber-js/max';
import dayjs from 'dayjs';
import {
  IsString as CVIsString,
  IsNumber as CVIsNumber,
  IsEmail as CVIsEmail,
  IsNotEmpty as CVIsNotEmpty,
  Length as CVLength,
  Min as CVMin,
  Max as CVMax,
  MinLength as CVMinLength,
  MaxLength as CVMaxLength,
  IsOptional as CVIsOptional,
  IsBoolean as CVIsBoolean,
  IsDate as CVIsDate,
  IsEnum as CVIsEnum,
  IsInt as CVIsInt,
  IsPositive as CVIsPositive,
  IsNegative as CVIsNegative,
  Matches as CVMatches,
  IsArray as CVIsArray,
  ArrayMinSize as CVArrayMinSize,
  ArrayMaxSize as CVArrayMaxSize,
  IsUrl as CVIsUrl,
  IsUUID as CVIsUUID,
  IsPhoneNumber as CVIsPhoneNumber,
  IsCreditCard as CVIsCreditCard,
  IsJSON as CVIsJSON,
  IsMongoId as CVIsMongoId,
  IsIn as CVIsIn,
  IsISO8601 as CVIsISO8601,
  IsNotEmptyObject as CVIsNotEmptyObject,
  IsJWT as CVIsJWT,
  IsObject as CVIsObject,
  ValidateNested as CVValidateNested,
  ValidationOptions,
  ValidationArguments,
  registerDecorator,
  isString,
} from 'class-validator';
import { t } from 'core/utilities/request-context';

import type { TranslationKeys } from 'core/types/i18n';

// Helper to create message function
function createMessageFn(
  key: TranslationKeys,
  extraParams?: Record<string, any>
) {
  return (args: ValidationArguments) => {
    const params: Record<string, any> = {
      property: args.property,
      ...extraParams,
    };
    return t(key, params);
  };
}

// String Validators
export function IsString(validationOptions?: ValidationOptions) {
  return CVIsString({
    ...validationOptions,
    message: createMessageFn('error.validation.isString'),
  });
}

export function IsNotEmpty(validationOptions?: ValidationOptions) {
  return CVIsNotEmpty({
    ...validationOptions,
    message: createMessageFn('error.validation.isNotEmpty'),
  });
}

export function Length(
  min: number,
  max?: number,
  validationOptions?: ValidationOptions
) {
  return CVLength(min, max, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.length', {
        property: args.property,
        min: String(min),
        max: String(max),
      });
    },
  });
}

export function MinLength(min: number, validationOptions?: ValidationOptions) {
  return CVMinLength(min, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.minLength', {
        property: args.property,
        min: String(min),
      });
    },
  });
}

export function MaxLength(max: number, validationOptions?: ValidationOptions) {
  return CVMaxLength(max, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.maxLength', {
        property: args.property,
        max: String(max),
      });
    },
  });
}

// Number Validators
export function IsNumber(validationOptions?: ValidationOptions) {
  return CVIsNumber(
    {},
    {
      ...validationOptions,
      message: createMessageFn('error.validation.isNumber'),
    }
  );
}

export function IsInt(validationOptions?: ValidationOptions) {
  return CVIsInt({
    ...validationOptions,
    message: createMessageFn('error.validation.isInt'),
  });
}

export function Min(min: number, validationOptions?: ValidationOptions) {
  return CVMin(min, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.min', {
        property: args.property,
        min: String(min),
      });
    },
  });
}

export function Max(max: number, validationOptions?: ValidationOptions) {
  return CVMax(max, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.max', {
        property: args.property,
        max: String(max),
      });
    },
  });
}

export function IsPositive(validationOptions?: ValidationOptions) {
  return CVIsPositive({
    ...validationOptions,
    message: createMessageFn('error.validation.isPositive'),
  });
}

export function IsNegative(validationOptions?: ValidationOptions) {
  return CVIsNegative({
    ...validationOptions,
    message: createMessageFn('error.validation.isNegative'),
  });
}

// Email and URL
export function IsEmail(validationOptions?: ValidationOptions) {
  return CVIsEmail(
    {},
    {
      ...validationOptions,
      message: createMessageFn('error.validation.isEmail'),
    }
  );
}

export function IsUrl(validationOptions?: ValidationOptions) {
  return CVIsUrl(
    {},
    {
      ...validationOptions,
      message: createMessageFn('error.validation.isUrl'),
    }
  );
}

// Boolean and Date
export function IsBoolean(validationOptions?: ValidationOptions) {
  return CVIsBoolean({
    ...validationOptions,
    message: createMessageFn('error.validation.isBoolean'),
  });
}

export function IsDate(validationOptions?: ValidationOptions) {
  return CVIsDate({
    ...validationOptions,
    message: createMessageFn('error.validation.isDate'),
  });
}

// Enum
export function IsEnum(entity: object, validationOptions?: ValidationOptions) {
  return CVIsEnum(entity, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.isEnum', {
        property: args.property,
        values: Object.values(entity).join(', '),
      });
    },
  });
}

// Pattern Matching
export function Matches(
  pattern: RegExp,
  validationOptions?: ValidationOptions
) {
  return CVMatches(pattern, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.matches', {
        property: args.property,
        pattern: pattern.toString(),
      });
    },
  });
}

// Array Validators
export function IsArray(validationOptions?: ValidationOptions) {
  return CVIsArray({
    ...validationOptions,
    message: createMessageFn('error.validation.isArray'),
  });
}

export function ArrayMinSize(
  min: number,
  validationOptions?: ValidationOptions
) {
  return CVArrayMinSize(min, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.arrayMinSize', {
        property: args.property,
        min: String(min),
      });
    },
  });
}

export function ArrayMaxSize(
  max: number,
  validationOptions?: ValidationOptions
) {
  return CVArrayMaxSize(max, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.arrayMaxSize', {
        property: args.property,
        max: String(max),
      });
    },
  });
}

// Special Formats
export function IsUUID(validationOptions?: ValidationOptions) {
  return CVIsUUID(undefined, {
    ...validationOptions,
    message: createMessageFn('error.validation.isUUID'),
  });
}

export function IsPhoneNumber(
  region?: CountryCode,
  validationOptions?: ValidationOptions
) {
  return CVIsPhoneNumber(region, {
    ...validationOptions,
    message: createMessageFn('error.validation.isPhoneNumber'),
  });
}

export function IsCreditCard(validationOptions?: ValidationOptions) {
  return CVIsCreditCard({
    ...validationOptions,
    message: createMessageFn('error.validation.isCreditCard'),
  });
}

export function IsJSON(validationOptions?: ValidationOptions) {
  return CVIsJSON({
    ...validationOptions,
    message: createMessageFn('error.validation.isJSON'),
  });
}

export function IsMongoId(validationOptions?: ValidationOptions) {
  return CVIsMongoId({
    ...validationOptions,
    message: createMessageFn('error.validation.isMongoId'),
  });
}

export function IsIn(values: any[], validationOptions?: ValidationOptions) {
  return CVIsIn(values, {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      return t('error.validation.isIn', {
        property: args.property,
        values: values.join(', '),
      });
    },
  });
}

export function IsISO8601(validationOptions?: ValidationOptions) {
  return CVIsISO8601(
    {},
    {
      ...validationOptions,
      message: createMessageFn('error.validation.isISO8601'),
    }
  );
}

export function IsJWT(validationOptions?: ValidationOptions) {
  return CVIsJWT({
    ...validationOptions,
    message: createMessageFn('error.validation.isJWT'),
  });
}

export function IsObject(validationOptions?: ValidationOptions) {
  return CVIsObject({
    ...validationOptions,
    message: createMessageFn('error.validation.isObject'),
  });
}

export function IsSlug(validationOptions?: ValidationOptions) {
  const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const MIN_LENGTH = 3;
  const MAX_LENGTH = 255;

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!isString(value)) return false;

          if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
            return false;
          }

          return SLUG_PATTERN.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;

          if (!isString(value)) {
            return t('error.validation.isSlugNotString', {
              property: args.property,
            });
          }

          if (value.length < MIN_LENGTH) {
            return t('error.validation.isSlugMinLength', {
              property: args.property,
              min: String(MIN_LENGTH),
            });
          }

          if (value.length > MAX_LENGTH) {
            return t('error.validation.isSlugMaxLength', {
              property: args.property,
              max: String(MAX_LENGTH),
            });
          }

          return t('error.validation.isSlug', {
            property: args.property,
          });
        },
      },
    });
  };
}

export function IsMinDateNow(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMinDateNow',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        /*

        2025-11-07T14:47:18.237Z -> User
        2025-11-07T14:47:19.048Z -> Server 
        2025-11-07T14:48:19.048Z -> Server + 1 MIN
        false

        */
        validate(value: any) {
          const marginMinutes = 1;

          return (
            value && dayjs(value).add(marginMinutes, 'minute').isAfter(dayjs())
          );
        },
        defaultMessage(args: ValidationArguments) {
          return t('error.validation.isMinDateNow', {
            property: args.property,
          });
        },
      },
    });
  };
}
export function IsMaxDateNow(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMaxDateNow',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value && dayjs(value).isAfter(dayjs());
        },
        defaultMessage(args: ValidationArguments) {
          return t('error.validation.isMaxDateNow', {
            property: args.property,
          });
        },
      },
    });
  };
}

export function IsDateBefore(
  property: string,
  marginMs = 5000,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isDateBefore',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const maxDate = obj[property];

          if (!value || !maxDate) return true; // skip if undefined

          return dayjs(value).subtract(1, 'minutes').isBefore(maxDate);
        },
        defaultMessage(args: ValidationArguments) {
          return t('error.validation.isDateBefore', {
            property: propertyName,
            keyName: property,
          });
        },
      },
    });
  };
}

export function IsDateAfter(
  property: string,
  marginMs = 5000,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const minDate = obj[property];

          if (!value || !minDate) return true;

          return dayjs(value).add(marginMs, 'milliseconds').isAfter(minDate);
        },
        defaultMessage(args: ValidationArguments) {
          return t('error.validation.isDateAfter', {
            property: propertyName,
            keyName: property,
          });
        },
      },
    });
  };
}

// Re-export decorators that don't need translation
export const IsOptional = CVIsOptional;
export const IsNotEmptyObject = CVIsNotEmptyObject;
export const ValidateNested = CVValidateNested;
