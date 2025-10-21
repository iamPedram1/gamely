import { AsyncLocalStorage } from 'async_hooks';
import { AnonymousError, InternalServerError } from 'core/utilites/errors';

// Types
import type { i18n as I18nType } from 'i18next';
import type { IUser } from 'api/user/user.types';
import type {
  TranslationKeys,
  TranslationVariables,
  TypedTFunction,
} from 'core/types/i18n';

/**
 * Represents the contextual data stored per request.
 * This is used for things like localization and user identification.
 */
export interface RequestContext {
  /** The translation function bound to the current request */
  t: TypedTFunction;

  /** The i18next instance used for translations */
  i18n: I18nType;

  /** The authenticated user information (if available) */
  user?: Pick<IUser, 'id'>;
}

/**
 * AsyncLocalStorage for maintaining per-request context
 * across asynchronous calls.
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Runs a given callback function with the specified request context.
 * All code executed within the callback (including async operations)
 * will have access to the provided context.
 *
 * @template T - The return type of the callback.
 * @param {RequestContext} context - The context to set for this execution.
 * @param {() => T} callback - The function to execute within the context.
 * @returns {T} The result returned by the callback.
 *
 */
export const runWithContext = <T>(
  context: RequestContext,
  callback: () => T
): T => {
  return requestContext.run(context, callback);
};

/**
 * Retrieves the current active request context.
 *
 * @returns {RequestContext | undefined} The current context, or undefined if not set.
 */
export const getContext = (): RequestContext | undefined =>
  requestContext.getStore();

/**
 * Translates a given key using the current request's translation function.
 * Throws an {@link AnonymousError} if no translation function is available.
 *
 * @template T - A translation key type.
 * @param {T} key - The translation key to look up.
 * @param {Partial<TranslationVariables<T>>} [options] - Optional variables for interpolation.
 * @returns {string} The translated string.
 *
 * @throws {AnonymousError} If no translation context is available.
 */
export const t = <T extends TranslationKeys>(
  key: T,
  options?: TranslationVariables<T>
): string => {
  const ctx = getContext();
  console.log(1, ctx?.t, key);

  if (!ctx?.t) return key;
  console.log(2, ctx?.t, key);

  return ctx.t(key, options);
};

export const i18nInstance = <T extends TranslationKeys>() => {
  const ctx = getContext();
  console.log(ctx);

  if (!ctx?.i18n) throw new InternalServerError();

  return ctx.i18n;
};
