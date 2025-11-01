import { singleton } from 'tsyringe';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import type { FlattenMaps } from 'mongoose';

/**
 * A lightweight base class providing generic helpers for mapping
 * Mongoose documents or plain objects into DTO instances.
 * @template TDoc - The Mongoose Document type or a record-like object.
 * @template TLean - The plain object type (lean version).
 */
export abstract class AbstractMapper<TDoc, TLean> {
  /**
   * Determines if the given entity is a Mongoose document.
   *
   * @param v - The entity to check.
   * @returns True if the entity is a Mongoose document.
   */
  protected isDocument(v: TDoc | TLean): v is TDoc {
    return (
      v &&
      typeof v === 'object' &&
      '_doc' in (v as any) &&
      typeof (v as any).toObject === 'function'
    );
  }

  /**
   * Converts a Mongoose document or lean object into a plain object.
   *
   * @param entity - The entity to convert.
   * @returns A plain JavaScript object.
   */
  protected toPlain(entity: TDoc | TLean): Record<string, any> {
    return this.isDocument(entity)
      ? (entity as any).toObject()
      : (entity as any);
  }

  /**
   * Maps a document or plain object to a DTO instance.
   *
   * @template TDto - DTO class type.
   * @param dtoClass - The DTO class constructor.
   * @param entity - The document or object to transform.
   * @returns An instance of the DTO.
   */
  protected toInstance<TDto>(
    dtoClass: ClassConstructor<TDto>,
    entity: TDoc | TLean
  ): TDto {
    return plainToInstance(dtoClass, this.toPlain(entity), {
      excludeExtraneousValues: true,
    });
  }
}

/**
 * A generic, reusable mapper that converts entities between
 * different DTO representations (client, management, summaries).
 *
 * @template TDoc - Mongoose document type.
 * @template TLean - Lean object type.
 * @template TClientDto - DTO type for client-facing APIs.
 * @template TManagementDto - DTO type for admin-facing APIs.
 * @template TClientSummaryDto - DTO type for client summaries.
 * @template TManagementSummaryDto - DTO type for admin summaries.
 */
@singleton()
export class BaseMapper<
  TDoc,
  TClientDto extends Record<string, any>,
  TManagementDto extends Record<string, any>,
  TClientSummaryDto extends Record<string, any>,
  TManagementSummaryDto extends Record<string, any>,
> extends AbstractMapper<TDoc, FlattenMaps<TDoc>> {
  constructor(
    private readonly ClientDtoClass: ClassConstructor<TClientDto>,
    private readonly ManagementDtoClass: ClassConstructor<TManagementDto>,
    private readonly ClientSummaryDtoClass: ClassConstructor<TClientSummaryDto>,
    private readonly AdminSummaryDtoClass: ClassConstructor<TManagementSummaryDto>
  ) {
    super();
  }

  /** Converts an entity into a client-facing DTO. */
  public toClientDto(entity: TDoc | FlattenMaps<TDoc>): TClientDto {
    return this.toInstance(this.ClientDtoClass, entity);
  }

  /** Converts an entity into a management-facing DTO. */
  public toManagementDto(entity: TDoc | FlattenMaps<TDoc>): TManagementDto {
    return this.toInstance(this.ManagementDtoClass, entity);
  }

  /** Converts an entity into a client-facing summary DTO. */
  public toClientSummaryDto(
    entity: TDoc | FlattenMaps<TDoc>
  ): TClientSummaryDto {
    return this.toInstance(this.ClientSummaryDtoClass, entity);
  }

  /** Converts an entity into a management-facing summary DTO. */
  public toManagementSummaryDto(
    entity: TDoc | FlattenMaps<TDoc>
  ): TManagementSummaryDto {
    return this.toInstance(this.AdminSummaryDtoClass, entity);
  }
}
