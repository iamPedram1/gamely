import type { HydratedDocument, Model, Types } from 'mongoose';

// Utilities
import { AnonymousError, ValidationError } from 'core/utilites/errors';

// Types
import BaseQueryService from 'core/services/base/base.query.service';
import { BaseTFunction } from 'core/services/base/base.service';
import { userContext } from 'core/utilites/request-context';

/**
 * Base service for CRUD and mutation operations on Mongoose models.
 */
class BaseValidationService<
  TSchema,
  TDoc extends HydratedDocument<TSchema> = HydratedDocument<TSchema>,
> {
  constructor(
    protected readonly model: Model<TSchema>,
    protected readonly queryService: BaseQueryService<TSchema, TDoc>,
    protected readonly t: BaseTFunction
  ) {}

  protected get user() {
    try {
      return userContext();
    } catch (error) {
      return null;
    }
  }

  async assertOwnership(document: string | Record<'creator', Types.ObjectId>) {
    if (!this.user || !this.user.id)
      throw new AnonymousError('Something wrong in user context');

    let isMadeBySelf = false;

    if (typeof document === 'string') {
      isMadeBySelf = await this.queryService.isMadeBySelf(
        document,
        this.user.id
      );
    } else {
      if (this.user.id === document.creator.toHexString()) isMadeBySelf = true;
    }

    if (!isMadeBySelf)
      throw new ValidationError(this.t('error.made_byself_error'));
  }
}

export default BaseValidationService;
