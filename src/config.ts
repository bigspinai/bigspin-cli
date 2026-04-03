import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';

import type {CliConfig} from './types.js';

export function getConfigDir(oclifConfigDir: string): string {
  return oclifConfigDir;
}

export function getConfigPath(oclifConfigDir: string): string {
  return join(getConfigDir(oclifConfigDir), 'config.json');
}

export function readConfig(oclifConfigDir: string): CliConfig {
  const configPath = getConfigPath(oclifConfigDir);
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const raw = readFileSync(configPath, 'utf8');
    return JSON.parse(raw) as CliConfig;
  } catch {
    return {};
  }
}

export function writeConfig(oclifConfigDir: string, partial: Partial<CliConfig>): void {
  const configDir = getConfigDir(oclifConfigDir);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, {recursive: true});
  }

  const existing = readConfig(oclifConfigDir);
  const merged = {...existing, ...partial};

  // Remove undefined values
  for (const key of Object.keys(merged)) {
    if (merged[key as keyof CliConfig] === undefined) {
      delete merged[key as keyof CliConfig];
    }
  }

  const configPath = getConfigPath(oclifConfigDir);
  writeFileSync(configPath, JSON.stringify(merged, null, 2) + '\n', {encoding: 'utf8', mode: 0o600});
}
