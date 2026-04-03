import {readConfig} from './config.js';

const DEFAULT_BASE_URL = 'https://app.bigspin.ai';

export interface ResolvedAuth {
  apiKey: string;
  baseUrl: string;
}

export function resolveAuth(flags: {
  'api-key'?: string;
  'base-url'?: string;
}, oclifConfigDir: string): ResolvedAuth {
  const config = readConfig(oclifConfigDir);

  const apiKey = flags['api-key']
    ?? process.env.BIGSPIN_API_KEY
    ?? config.api_key;

  const baseUrl = flags['base-url']
    ?? process.env.BIGSPIN_BASE_URL
    ?? config.base_url
    ?? DEFAULT_BASE_URL;

  if (!apiKey) {
    throw new Error(
      'No API key found. Set one using:\n'
      + '  bigspin auth login\n'
      + '  export BIGSPIN_API_KEY=sk-bigspin-api...\n'
      + '  bigspin config set api_key sk-bigspin-api...',
    );
  }

  return {apiKey, baseUrl};
}

export function resolveBaseUrl(flags: {
  'base-url'?: string;
}, oclifConfigDir: string): string {
  const config = readConfig(oclifConfigDir);
  return flags['base-url']
    ?? process.env.BIGSPIN_BASE_URL
    ?? config.base_url
    ?? DEFAULT_BASE_URL;
}
