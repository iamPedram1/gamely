type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

interface ApiResponseProps<T = null> {
  message?: string;
  errors?: string[];
  data: T | null;
}

interface ApiResponseConfig {
  status: number;
  httpMethod?: HttpMethod;
  featureName?: string;
}

export default class ApiResponse<T = null> implements ApiResponseProps<T> {
  isSuccess: boolean;
  message: string = '';
  errors?: string[] = [];
  data: T | null = null;

  constructor(
    config: ApiResponseConfig,
    payload: Partial<ApiResponseProps<T>> = {}
  ) {
    this.isSuccess = config.status >= 200 && config.status < 300;
    this.data = payload.data ?? null;
    this.errors = payload.errors ?? [];

    if (payload.message) this.message = payload.message;
    else {
      this.message = this.generateDefaultMessage(
        this.isSuccess,
        config.httpMethod,
        config.featureName
      );
    }
  }

  private generateDefaultMessage(
    isSuccess: boolean,
    method?: HttpMethod,
    featureName?: string
  ): string {
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
  }
}
