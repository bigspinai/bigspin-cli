import {ApiError} from './types.js';
import type {ApiErrorBody} from './types.js';

const DEFAULT_TIMEOUT_MS = 30_000;

export class BigspinClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly version: string = '0.1.0',
  ) {}

  async get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    return this.request<T>(url.toString(), {method: 'GET'});
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(new URL(path, this.baseUrl).toString(), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          ...init.headers,
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': `bigspin-cli/${this.version}`,
        },
      });

      let body: T | ApiErrorBody;
      try {
        body = await response.json() as T | ApiErrorBody;
      } catch {
        throw new ApiError(
          'parse_error',
          response.status,
          `Server returned non-JSON response (HTTP ${response.status}). The API may be unavailable.`,
        );
      }

      if (!response.ok) {
        const errorBody = body as ApiErrorBody;
        if (errorBody.error) {
          throw new ApiError(
            errorBody.error.type,
            errorBody.error.code,
            errorBody.error.message,
            errorBody.error.param,
            errorBody.error.details,
          );
        }

        throw new ApiError(
          'unknown_error',
          response.status,
          `Request failed with status ${response.status}`,
        );
      }

      return body as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('timeout_error', 408, 'Request timed out after 30 seconds');
      }

      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
        throw new ApiError(
          'network_error',
          0,
          `Network error: ${error.message}. Check your internet connection and base URL.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
