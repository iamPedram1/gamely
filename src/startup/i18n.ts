import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import type { Express } from 'express';

// Middlewares
import { context } from 'middleware/context';

// Dictionaries
import commonEN from '../locales/en/common';
import modelsEN from '../locales/en/models';
import errorEN from '../locales/en/error';
import messagesEN from '../locales/en/messages';
import commonFA from '../locales/fa/common';
import modelsFA from '../locales/fa/models';
import errorFA from '../locales/fa/error';
import messagesFA from '../locales/fa/messages';

export default async function i18nStartup(app: Express) {
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

  await i18next.use(middleware.LanguageDetector).init({
    fallbackLng: 'fa',
    preload: ['fa'],
    ns: ['error', 'models', 'common', 'messages'],
    defaultNS: 'error',
    resources,
    returnObjects: false, // Disable to ensure strings are returned
    keySeparator: '.',
    nsSeparator: '.',
  });

  app.use(middleware.handle(i18next));
  app.use(context);
}
