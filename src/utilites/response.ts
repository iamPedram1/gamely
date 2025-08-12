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
  config: ApiResponseConfig<T>
): void => {
  const isSuccess = status >= 200 && status < 300;
  const data = config.body?.data ?? null;
  const errors = config?.body?.errors ?? [];
  const message = config?.body?.message
    ? config?.body?.message
    : generateDefaultMessage(isSuccess, config.httpMethod, config.featureName);

  const response: IApiResponse<T> = {
    data,
    isSuccess,
    errors,
    message,
  };

  res.send(status).json(response);
};

export default sendResponse;
