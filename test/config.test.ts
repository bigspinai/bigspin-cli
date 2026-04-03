import {mkdtempSync, mkdirSync, readFileSync, statSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it, expect, beforeEach, afterEach} from 'vitest';

import {readConfig, writeConfig, getConfigPath} from '../src/config.js';

describe('config', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'bigspin-cli-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, {recursive: true, force: true});
  });

  it('readConfig returns empty object when no config file exists', () => {
    const config = readConfig(tempDir);
    expect(config).toEqual({});
  });

  it('writeConfig creates the config file with correct content', () => {
    writeConfig(tempDir, {api_key: 'sk-test-123'});
    const configPath = getConfigPath(tempDir);
    const raw = readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed).toEqual({api_key: 'sk-test-123'});
  });

  it('writeConfig merges with existing config', () => {
    writeConfig(tempDir, {api_key: 'sk-test-123'});
    writeConfig(tempDir, {base_url: 'https://custom.example.com'});
    const config = readConfig(tempDir);
    expect(config).toEqual({
      api_key: 'sk-test-123',
      base_url: 'https://custom.example.com',
    });
  });

  it('readConfig reads back written config', () => {
    writeConfig(tempDir, {api_key: 'sk-key', base_url: 'https://example.com'});
    const config = readConfig(tempDir);
    expect(config.api_key).toBe('sk-key');
    expect(config.base_url).toBe('https://example.com');
  });

  it('config file has 0600 permissions', () => {
    writeConfig(tempDir, {api_key: 'sk-secret'});
    const configPath = getConfigPath(tempDir);
    const stats = statSync(configPath);
    // 0o600 = owner read/write only (octal 33152 includes file type bits, mask with 0o777)
    const mode = stats.mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('writeConfig removes undefined values', () => {
    writeConfig(tempDir, {api_key: 'sk-test', base_url: 'https://example.com'});
    writeConfig(tempDir, {base_url: undefined});
    const config = readConfig(tempDir);
    expect(config).toEqual({api_key: 'sk-test'});
  });

  it('readConfig returns empty object for malformed JSON', () => {
    const configPath = getConfigPath(tempDir);
    mkdirSync(tempDir, {recursive: true});
    writeFileSync(configPath, 'not valid json', 'utf8');
    const config = readConfig(tempDir);
    expect(config).toEqual({});
  });
});
