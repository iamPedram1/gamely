import { singleton } from 'tsyringe';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import type { Document } from 'mongoose';

/**
 * Generic mapper base to reduce duplicate mapper implementations across features.
 *
 * Usage: extend this class and optionally override `normalize` to handle
 * entity-specific normalization (title/name fallbacks, nested populated fields, etc.).
 */
@singleton()
export class BaseMapper<
  TDoc extends Document | Record<string, any>,
  TLean extends Record<string, any>,
  TClientDto,
  TManagementDto,
  TClientSummaryDto,
  TManagementSummaryDto,
> {
  constructor(
    private ClientDtoClass: ClassConstructor<TClientDto>,
    private ManagementDtoClass: ClassConstructor<TManagementDto>,
    private ClientSummaryDtoClass: ClassConstructor<TClientSummaryDto>,
    private AdminSummaryDtoClass: ClassConstructor<TManagementSummaryDto>
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

  public toClientDto(entity: TDoc | TLean): TClientDto {
    return plainToInstance(this.ClientDtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }

  public toManagementDto(entity: TDoc | TLean): TManagementDto {
    return plainToInstance(this.ManagementDtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }

  public toClientSummaryDto(entity: TDoc | TLean): TClientSummaryDto {
    return plainToInstance(this.ClientSummaryDtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }
  public toManagementSummaryDto(entity: TDoc | TLean): TManagementSummaryDto {
    return plainToInstance(this.AdminSummaryDtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }
}
