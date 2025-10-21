import type { HydratedDocument, Model, Types } from 'mongoose';

// Utilities
import { AnonymousError, ValidationError } from 'core/utilites/errors';

// Types
import BaseQueryService from 'core/services/base/base.query.service';
import { IUserContext } from 'api/user/user.types';
import { BaseTFunction } from 'core/services/base/base.service';

/**
 * Base service for CRUD and mutation operations on Mongoose models.
 */
class BaseValidationService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> {
  constructor(
    protected readonly model: Model<TSchema>,
    protected readonly user: IUserContext | null,
    protected readonly queryService: BaseQueryService<TSchema, TDoc>,
    protected readonly t: BaseTFunction
  ) {}

  async assertOwnership(document: string | Types.ObjectId) {
    if (!this.user || !this.user.id)
      throw new AnonymousError('Something wrong in user context');

    const isMadeBySelf = await this.queryService.isMadeBySelf(
      typeof document === 'string' ? document : document.toHexString(),
      this.user.id
    );

    if (!isMadeBySelf)
      throw new ValidationError(this.t('error.made_byself_error'));
  }
}

export default BaseValidationService;
