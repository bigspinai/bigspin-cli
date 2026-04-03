import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

import {resolveAuth, resolveBaseUrl} from '../src/auth.js';
import {writeConfig} from '../src/config.js';

describe('resolveAuth', () => {
  let tempDir: string;
  const originalEnv = process.env;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'bigspin-cli-auth-test-'));
    vi.stubEnv('BIGSPIN_API_KEY', '');
    vi.stubEnv('BIGSPIN_BASE_URL', '');
    delete process.env.BIGSPIN_API_KEY;
    delete process.env.BIGSPIN_BASE_URL;
  });

  afterEach(() => {
    rmSync(tempDir, {recursive: true, force: true});
    vi.unstubAllEnvs();
  });

  it('flag takes priority over env var', () => {
    process.env.BIGSPIN_API_KEY = 'env-key';
    writeConfig(tempDir, {api_key: 'config-key'});

    const auth = resolveAuth({'api-key': 'flag-key'}, tempDir);
    expect(auth.apiKey).toBe('flag-key');
  });

  it('env var takes priority over config file', () => {
    process.env.BIGSPIN_API_KEY = 'env-key';
    writeConfig(tempDir, {api_key: 'config-key'});

    const auth = resolveAuth({}, tempDir);
    expect(auth.apiKey).toBe('env-key');
  });

  it('config file is used as fallback', () => {
    writeConfig(tempDir, {api_key: 'config-key'});

    const auth = resolveAuth({}, tempDir);
    expect(auth.apiKey).toBe('config-key');
  });

  it('throws error when no API key found', () => {
    expect(() => resolveAuth({}, tempDir)).toThrow('No API key found');
  });

  it('error message includes helpful instructions', () => {
    expect(() => resolveAuth({}, tempDir)).toThrow('bigspin auth login');
    expect(() => resolveAuth({}, tempDir)).toThrow('BIGSPIN_API_KEY');
  });

  it('base URL defaults to https://app.bigspin.ai', () => {
    const auth = resolveAuth({'api-key': 'sk-test'}, tempDir);
    expect(auth.baseUrl).toBe('https://app.bigspin.ai');
  });

  it('base URL flag takes priority over env var', () => {
    process.env.BIGSPIN_BASE_URL = 'https://env.example.com';
    writeConfig(tempDir, {base_url: 'https://config.example.com'});

    const auth = resolveAuth({'api-key': 'sk-test', 'base-url': 'https://flag.example.com'}, tempDir);
    expect(auth.baseUrl).toBe('https://flag.example.com');
  });

  it('base URL env var takes priority over config', () => {
    process.env.BIGSPIN_BASE_URL = 'https://env.example.com';
    writeConfig(tempDir, {api_key: 'sk-test', base_url: 'https://config.example.com'});

    const auth = resolveAuth({}, tempDir);
    expect(auth.baseUrl).toBe('https://env.example.com');
  });

  it('base URL config is used as fallback', () => {
    writeConfig(tempDir, {api_key: 'sk-test', base_url: 'https://config.example.com'});

    const auth = resolveAuth({}, tempDir);
    expect(auth.baseUrl).toBe('https://config.example.com');
  });
});

describe('resolveBaseUrl', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'bigspin-cli-baseurl-test-'));
    delete process.env.BIGSPIN_BASE_URL;
  });

  afterEach(() => {
    rmSync(tempDir, {recursive: true, force: true});
  });

  it('defaults to https://app.bigspin.ai', () => {
    const url = resolveBaseUrl({}, tempDir);
    expect(url).toBe('https://app.bigspin.ai');
  });

  it('flag takes priority', () => {
    process.env.BIGSPIN_BASE_URL = 'https://env.example.com';
    const url = resolveBaseUrl({'base-url': 'https://flag.example.com'}, tempDir);
    expect(url).toBe('https://flag.example.com');
  });
});
