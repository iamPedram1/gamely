// --- Import dictionaries ---
import commonJSON from '../locales/en/common';
import modelsJSON from '../locales/en/models';
import errorJSON from '../locales/en/error';
import messagesJSON from '../locales/en/messages';

export const dictionaries = {
  errorJSON,
  modelsJSON,
  commonJSON,
  messagesJSON,
} as const;

// --- --- --- Helper types --- --- ---

/**
 * Recursively create nested keys like
 * "namespace.nestedKey1.nestedKey2"
 */
type WithNamespaceKey<T, NS extends string> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? WithNamespaceKey<T[K], `${NS}.${K & string}`>
    : `${NS}.${K & string}`;
}[keyof T];

/**
 * Extract placeholders from a string like "{{name}}" -> "name"
 */
type ExtractPlaceholders<S extends string> =
  S extends `${string}{{${infer Param}}}${infer Rest}`
    ? Param | ExtractPlaceholders<Rest>
    : never;

/**
 * Recursively extract placeholders from nested objects
 */
type ExtractPlaceholdersRec<T> = T extends string
  ? ExtractPlaceholders<T>
  : T extends { singular: infer S extends string; plural: string }
    ? ExtractPlaceholders<S>
    : T extends Record<string, any>
      ? { [K in keyof T]: ExtractPlaceholdersRec<T[K]> }[keyof T]
      : never;

/**
 * Collect placeholders per dictionary (top-level keys)
 */
type DictPlaceholders<Dict> = {
  [K in keyof Dict]: ExtractPlaceholdersRec<Dict[K]>;
};

/**
 * Merge placeholders from all dictionaries
 */
type PlaceholderMap = DictPlaceholders<(typeof dictionaries)['errorJSON']> &
  DictPlaceholders<(typeof dictionaries)['commonJSON']> &
  DictPlaceholders<(typeof dictionaries)['modelsJSON']> &
  DictPlaceholders<(typeof dictionaries)['messagesJSON']>;

// --- --- --- Translation keys --- --- ---

export type ErrorTranslationKeys = WithNamespaceKey<
  (typeof dictionaries)['errorJSON'],
  'error'
>;
export type CommonTranslationKeys = WithNamespaceKey<
  (typeof dictionaries)['commonJSON'],
  'common'
>;
export type ModelsTranslationKeys = WithNamespaceKey<
  (typeof dictionaries)['modelsJSON'],
  'models'
>;
export type MessagesTranslationKeys = WithNamespaceKey<
  (typeof dictionaries)['messagesJSON'],
  'messages'
>;

export type TranslationKeys =
  | WithNamespaceKey<(typeof dictionaries)['errorJSON'], 'error'>
  | WithNamespaceKey<(typeof dictionaries)['commonJSON'], 'common'>
  | WithNamespaceKey<(typeof dictionaries)['modelsJSON'], 'models'>
  | WithNamespaceKey<(typeof dictionaries)['messagesJSON'], 'messages'>;

/**
 * Extract top-level dictionary key from nested key
 * e.g., "error.User.singular" -> "User"
 */
type ExtractBaseKey<K extends string> = K extends `${string}.${infer Rest}`
  ? Rest extends `${infer Sub}.${string}`
    ? Sub
    : Rest
  : K;

/**
 * Typed variables per key
 * Optional if the key has no placeholders
 */
export type TranslationVariables<K extends TranslationKeys> = [
  PlaceholderMap[ExtractBaseKey<K>],
] extends [never]
  ? undefined
  : Record<PlaceholderMap[ExtractBaseKey<K>], string>;

// --- --- --- Typed TFunction --- --- ---

export type TypedTFunction = <K extends TranslationKeys>(
  key: K,
  options?: TranslationVariables<K>
) => string;
