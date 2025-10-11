import { plainToInstance, ClassConstructor } from 'class-transformer';
import type { Document } from 'mongoose';

/**
 * Generic mapper base to reduce duplicate mapper implementations across features.
 *
 * Usage: extend this class and optionally override `normalize` to handle
 * entity-specific normalization (title/name fallbacks, nested populated fields, etc.).
 */
export class BaseMapper<
  TDoc extends Document | Record<string, any>,
  TLean extends Record<string, any>,
  TDto,
  TSummaryDto,
> {
  constructor(
    private dtoClass: ClassConstructor<TDto>,
    private summaryDtoClass: ClassConstructor<TSummaryDto>
  ) {}

  protected isDocument(v: TDoc | TLean): v is TDoc {
    return (
      v &&
      typeof (v as any) === 'object' &&
      '_doc' in (v as any) &&
      typeof (v as any).toObject === 'function'
    );
  }

  protected toPlain(entity: TDoc | TLean): Record<string, any> {
    return this.isDocument(entity)
      ? (entity as any).toObject()
      : (entity as any);
  }

  public toDto(entity: TDoc | TLean): TDto {
    return plainToInstance(this.dtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }

  public toSummaryDto(entity: TDoc | TLean): TSummaryDto {
    return plainToInstance(this.summaryDtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }
}
