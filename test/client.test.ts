import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

import {BigspinClient} from '../src/client.js';
import {ApiError} from '../src/types.js';

describe('BigspinClient', () => {
  let client: BigspinClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    client = new BigspinClient('https://api.example.com', 'sk-test-key', '1.0.0');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET requests', () => {
    it('sends correct URL and headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: []}),
      });

      await client.get('/api/v1/projects');

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.example.com/api/v1/projects');
      expect(init.method).toBe('GET');
      expect(init.headers.Authorization).toBe('Bearer sk-test-key');
      expect(init.headers['User-Agent']).toBe('bigspin-cli/1.0.0');
    });

    it('appends query string from params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: []}),
      });

      await client.get('/api/v1/projects', {page: '1', limit: '20'});

      const [url] = mockFetch.mock.calls[0];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('page')).toBe('1');
      expect(parsed.searchParams.get('limit')).toBe('20');
    });

    it('skips undefined params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({data: []}),
      });

      await client.get('/api/v1/projects', {page: '1', filter: undefined});

      const [url] = mockFetch.mock.calls[0];
      const parsed = new URL(url);
      expect(parsed.searchParams.get('page')).toBe('1');
      expect(parsed.searchParams.has('filter')).toBe(false);
    });
  });

  describe('POST requests', () => {
    it('sends JSON body with correct content-type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({success: true, data: {id: 'test'}}),
      });

      const body = {name: 'Test', turns: [{role: 'user', content: 'Hello'}]};
      await client.post('/api/v1/transcripts', body);

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.example.com/api/v1/transcripts');
      expect(init.method).toBe('POST');
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(init.headers.Authorization).toBe('Bearer sk-test-key');
      expect(JSON.parse(init.body)).toEqual(body);
    });
  });

  describe('error handling', () => {
    it('parses structured API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            type: 'authentication_error',
            code: 401,
            message: 'Invalid API key',
            param: undefined,
            details: undefined,
          },
        }),
      });

      await expect(client.get('/api/v1/projects')).rejects.toThrow(ApiError);
      await mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            type: 'authentication_error',
            code: 401,
            message: 'Invalid API key',
          },
        }),
      });

      try {
        await client.get('/api/v1/projects');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.type).toBe('authentication_error');
        expect(apiError.statusCode).toBe(401);
        expect(apiError.message).toBe('Invalid API key');
      }
    });

    it('handles error responses without structured error body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({message: 'Internal server error'}),
      });

      await expect(client.get('/api/v1/projects')).rejects.toThrow(ApiError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({message: 'Internal server error'}),
      });

      try {
        await client.get('/api/v1/projects');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.type).toBe('unknown_error');
        expect(apiError.statusCode).toBe(500);
      }
    });

    it('catches network errors and wraps them', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(client.get('/api/v1/projects')).rejects.toThrow(ApiError);

      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      try {
        await client.get('/api/v1/projects');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.type).toBe('network_error');
        expect(apiError.statusCode).toBe(0);
        expect(apiError.message).toContain('fetch failed');
      }
    });

    it('handles timeout errors', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new DOMException('The operation was aborted', 'AbortError');
        return Promise.reject(error);
      });

      await expect(client.get('/api/v1/projects')).rejects.toThrow(ApiError);

      mockFetch.mockImplementationOnce(() => {
        const error = new DOMException('The operation was aborted', 'AbortError');
        return Promise.reject(error);
      });

      try {
        await client.get('/api/v1/projects');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.type).toBe('timeout_error');
        expect(apiError.statusCode).toBe(408);
        expect(apiError.message).toContain('timed out');
      }
    });
  });
});
