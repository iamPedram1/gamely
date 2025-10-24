export interface WithTranslations<T> {
  translations: WithDictionaries<T>;
}

export interface WithDictionaries<T> {
  en: T;
  fa: T;
}
