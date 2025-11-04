import type { Response } from 'express';
import { ModelsTranslationKeys } from 'core/types/i18n';
import { t } from 'core/utilities/request-context';

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface IApiResponse<T = null> {
  message?: string;
  isSuccess: boolean;
  errors?: string[];
  data: T | null;
  statusCode: number;
  errorDetails: Record<string, any>;
}
export type IApiBatchResult = {
  id: string;
  success: boolean;
  message: string;
};

export interface IApiBatchResponse {
  results: IApiBatchResult[];
  errors: string[];
  successIds: string[];
  failedIds: string[];
  totalCount: number;
  successCount: number;
  isAllSucceed: boolean;
}

interface ApiResponseConfig<T> {
  httpMethod?: HttpMethod;
  featureName?: ModelsTranslationKeys;
  customName?: string;
  body?: Partial<IApiResponse<T>>;
}

const generateDefaultMessage = (
  isSuccess: boolean,
  method?: HttpMethod,
  featureName?: ModelsTranslationKeys,
  customName?: string
): string => {
  if (!isSuccess) return t('common.request_failed');

  const name = customName
    ? customName
    : featureName
      ? t(featureName)
      : t('common.document');

  switch (method) {
    case 'GET':
      return t('messages.generics.get', { name });
    case 'POST':
      return t('messages.generics.post', { name });
    case 'PUT':
      return t('messages.generics.put', { name });
    case 'PATCH':
      return t('messages.generics.patch', { name });
    case 'DELETE':
      return t('messages.generics.delete', { name });
    default:
      return t('messages.generics.else');
  }
};

const sendResponse = <T>(
  res: Response,
  status: number,
  config?: ApiResponseConfig<T>
): void => {
  const isSuccess = config?.body?.isSuccess || (status >= 200 && status < 300);
  const statusCode = status || 500;
  const data = config?.body?.data ?? null;
  const errors = config?.body?.errors ?? [];
  const errorDetails = config?.body?.errorDetails || {};
  const message = config?.body?.message
    ? config?.body?.message
    : generateDefaultMessage(
        isSuccess,
        config?.httpMethod,
        config?.featureName,
        config?.customName
      );

  const response: IApiResponse<T> = {
    statusCode,
    isSuccess,
    data,
    message,
    errors,
    errorDetails,
  };

  res.status(status).json(response);
};

export const sendBatchResponse = (
  res: Response,
  status: number,
  config: ApiResponseConfig<IApiBatchResponse>
): void => {
  sendResponse(res, status, config);
};

export default sendResponse;
