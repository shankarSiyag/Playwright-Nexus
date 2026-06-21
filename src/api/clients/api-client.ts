import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { envConfig } from '../../../config/env.config';
import { logger } from '../../utils/logger';

export class ApiClient {
  private context!: APIRequestContext;

  async init(): Promise<ApiClient> {
    this.context = await request.newContext({
      baseURL: envConfig.apiBaseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': envConfig.apiKey,
        'User-Agent': 'playwright-multi-env-framework/1.0',
      },
      timeout: envConfig.defaultTimeout,
    });
    console.log("Api-Client call in which init method")
    return this;
  }

  async get(endpoint: string, params?: Record<string, string>) {
    logger.debug(`GET ${endpoint}`, params);
    return this.context.get(endpoint, { params });

  }

  async post(endpoint: string, data: unknown) {
    logger.debug(`POST ${endpoint}`, data);
    return this.context.post(endpoint, { data });


  }

  async put(endpoint: string, data: unknown): Promise<APIResponse> {
    logger.debug(`PUT ${endpoint}`, data);
    return this.context.put(endpoint, { data });
  }

  async patch(endpoint: string, data: unknown): Promise<APIResponse> {
    logger.debug(`PATCH ${endpoint}`, data);
    return this.context.patch(endpoint, { data });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    logger.debug(`DELETE ${endpoint}`);
    return this.context.delete(endpoint);
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }

  get raw(): APIRequestContext {
    return this.context;
  }
}
