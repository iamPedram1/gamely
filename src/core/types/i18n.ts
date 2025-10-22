// --- Import dictionaries ---
import commonJSON from '../../locales/en/common';
import modelsJSON from '../../locales/en/models';
import errorJSON from '../../locales/en/error';
import messagesJSON from '../../locales/en/messages';

export const dictionaries = {
  errorJSON,
  modelsJSON,
  commonJSON,
  messagesJSON,
} as const;

/**
 * Recursively creates nested keys like "namespace.nestedKey1.nestedKey2"
 */
type WithNamespaceKey<T, NS extends string> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? WithNamespaceKey<T[K], `${NS}.${K & string}`>
    : `${NS}.${K & string}`;
}[keyof T];

/**
 * Extracts placeholders from a string like "{{name}}" -> "name"
 */
type ExtractPlaceholders<S extends string> =
  S extends `${string}{{${infer Param}}}${infer Rest}`
    ? Param | ExtractPlaceholders<Rest>
    : never;

/**
 * Recursively extracts placeholders from nested objects
 */
type ExtractPlaceholdersRec<T> = T extends string
  ? ExtractPlaceholders<T>
  : T extends { singular: infer S extends string; plural: string }
    ? ExtractPlaceholders<S>
    : T extends Record<string, any>
      ? { [K in keyof T]: ExtractPlaceholdersRec<T[K]> }[keyof T]
      : never;

/**
 * Navigates to the exact value in the dictionary using the full key path
 */
type GetValueAtPath<
  T,
  K extends string,
> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? GetValueAtPath<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

/**
 * Extracts placeholders for a specific translation key path
 */
type GetPlaceholders<Dict, K extends string> = ExtractPlaceholdersRec<
  GetValueAtPath<Dict, K>
>;

// --- --- --- Translation key types --- --- ---

export type ErrorTranslationKeys = WithNamespaceKey<
  typeof dictionaries.errorJSON,
  'error'
>;
export type CommonTranslationKeys = WithNamespaceKey<
  typeof dictionaries.commonJSON,
  'common'
>;
export type ModelsTranslationKeys = WithNamespaceKey<
  typeof dictionaries.modelsJSON,
  'models'
>;
export type MessagesTranslationKeys = WithNamespaceKey<
  typeof dictionaries.messagesJSON,
  'messages'
>;

export type TranslationKeys =
  | ErrorTranslationKeys
  | CommonTranslationKeys
  | ModelsTranslationKeys
  | MessagesTranslationKeys;

// --- --- --- Translation variables type --- --- ---

type VariablesForNamespace<Dict, Rest extends string> = [
  GetPlaceholders<Dict, Rest>,
] extends [never]
  ? undefined
  : Record<GetPlaceholders<Dict, Rest>, string>;

export type TranslationVariables<K extends TranslationKeys> =
  K extends `error.${infer Rest}`
    ? VariablesForNamespace<typeof dictionaries.errorJSON, Rest>
    : K extends `common.${infer Rest}`
      ? VariablesForNamespace<typeof dictionaries.commonJSON, Rest>
      : K extends `models.${infer Rest}`
        ? VariablesForNamespace<typeof dictionaries.modelsJSON, Rest>
        : K extends `messages.${infer Rest}`
          ? VariablesForNamespace<typeof dictionaries.messagesJSON, Rest>
          : undefined;

// --- --- --- Typed translation function --- --- ---

export type TypedTFunction = <K extends TranslationKeys>(
  key: K,
  options?: TranslationVariables<K>
) => string;
