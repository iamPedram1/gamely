import type { Response } from 'express';

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

interface IApiResponse<T = null> {
  message?: string;
  isSuccess: boolean;
  errors?: string[];
  data: T | null;
  statusCode: number;
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
  featureName?: string;
  body?: Partial<IApiResponse<T>>;
}

const generateDefaultMessage = (
  isSuccess: boolean,
  method?: HttpMethod,
  featureName?: string
): string => {
  if (!isSuccess) return 'Request failed due to an error.';

  const name = featureName ?? 'Document';

  switch (method) {
    case 'GET':
      return `${name} received successfully.`;
    case 'POST':
      return `${name} created successfully.`;
    case 'PUT':
    case 'PATCH':
      return `${name} updated successfully.`;
    case 'DELETE':
      return `${name} deleted successfully.`;
    default:
      return 'Request processed successfully.';
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
  const message = config?.body?.message
    ? config?.body?.message
    : generateDefaultMessage(
        isSuccess,
        config?.httpMethod,
        config?.featureName
      );

  const response: IApiResponse<T> = {
    isSuccess,
    message,
    data,
    statusCode,
    errors,
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
