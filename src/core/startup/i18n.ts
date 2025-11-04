import i18next from 'i18next';
import type { Express } from 'express';
import { handle, LanguageDetector } from 'i18next-http-middleware';

// Middlewares
import { context } from 'core/middlewares/context';

// Dictionaries
import commonEN from '../../locales/en/common';
import modelsEN from '../../locales/en/models';
import errorEN from '../../locales/en/error';
import messagesEN from '../../locales/en/messages';
import commonFA from '../../locales/fa/common';
import modelsFA from '../../locales/fa/models';
import errorFA from '../../locales/fa/error';
import messagesFA from '../../locales/fa/messages';

export default function i18nStartup(app: Express) {
  const resources = {
    en: {
      error: errorEN,
      models: modelsEN,
      common: commonEN,
      messages: messagesEN,
    },
    fa: {
      error: errorFA,
      models: modelsFA,
      common: commonFA,
      messages: messagesFA,
    },
  };

  i18next.use(LanguageDetector).init({
    fallbackLng: 'en',
    preload: ['fa'],
    ns: ['error', 'models', 'common', 'messages'],
    defaultNS: 'error',
    resources,
    keySeparator: '.',
    nsSeparator: '.',
    interpolation: {
      escapeValue: false,
    },
  });

  app.use(handle(i18next));
  app.use(context);
}
