import type { HydratedDocument, Model, Types } from 'mongoose';

// Utilities
import { AnonymousError, ValidationError } from 'core/utilites/errors';

// Types
import BaseQueryService from 'core/services/base/base.query.service';
import { BaseTFunction } from 'core/services/base/base.service';
import { userContext } from 'core/utilites/request-context';
import { UserRole } from 'features/shared/user/user.types';

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

  protected get currentUser() {
    return userContext();
  }

  async assertOwnership(
    document: string | Record<'creator', Types.ObjectId>,
    throwError: boolean = true
  ) {
    let isMadeBySelf = false;
    if (this.currentUser.is('admin')) return true;

    if (typeof document === 'string') {
      isMadeBySelf = await this.queryService.isMadeBySelf(
        document,
        this.currentUser.id
      );
    } else {
      if (this.currentUser.id === document.creator.toHexString())
        isMadeBySelf = true;
    }

    if (!isMadeBySelf && throwError)
      throw new ValidationError(this.t('error.made_byself_error'));
    return isMadeBySelf;
  }
}

export default BaseValidationService;
