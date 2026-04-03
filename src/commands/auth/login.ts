import {createInterface} from 'node:readline';

import {Flags} from '@oclif/core';

import {BaseCommand} from '../../base-command.js';
import {BigspinClient} from '../../client.js';
import {resolveBaseUrl} from '../../auth.js';
import {writeConfig} from '../../config.js';
import {ApiError} from '../../types.js';
import type {ApiPaginatedResponse, ProjectSummary} from '../../types.js';

const API_KEY_PREFIX_PATTERN = /^sk-(bigspin|prism)-api/;

function promptForToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });

    // Mask input by writing to stderr directly
    process.stderr.write('? Enter your API key (from https://app.bigspin.ai → Settings → API Keys): ');

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let input = '';
    const onData = (char: Buffer): void => {
      const c = char.toString();
      if (c === '\n' || c === '\r') {
        process.stderr.write('\n');
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw ?? false);
        }

        stdin.removeListener('data', onData);
        rl.close();
        resolve(input);
      } else if (c === '\u0003') {
        // Ctrl+C
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw ?? false);
        }

        stdin.removeListener('data', onData);
        rl.close();
        reject(new Error('User cancelled'));
      } else if (c === '\u007F' || c === '\b') {
        // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stderr.write('\b \b');
        }
      } else {
        input += c;
        process.stderr.write('*');
      }
    };

    stdin.on('data', onData);
  });
}

export default class AuthLogin extends BaseCommand<typeof AuthLogin> {
  static override description = 'Authenticate with the Bigspin API';

  static override examples = [
    '<%= config.bin %> auth login',
    '<%= config.bin %> auth login --token sk-bigspin-api03-...',
  ];

  static override flags = {
    token: Flags.string({
      description: 'API key for non-interactive login',
    }),
  };

  public async run(): Promise<{success: boolean}> {
    let token = this.flags.token;

    if (!token) {
      token = await promptForToken();
    }

    token = token.trim();

    if (!API_KEY_PREFIX_PATTERN.test(token)) {
      this.error('Invalid API key format. Key must start with "sk-bigspin-api" or "sk-prism-api".', {exit: 1});
    }

    // Verify the key works
    const baseUrl = resolveBaseUrl(this.flags as {'base-url'?: string}, this.config.configDir);
    const client = new BigspinClient(baseUrl, token, this.config.version);

    try {
      await client.get<ApiPaginatedResponse<ProjectSummary>>('/public/api/v1/projects', {limit: '1'});
    } catch (error) {
      if (error instanceof ApiError && error.type === 'authentication_error') {
        this.error('Authentication failed. Please check your API key and try again.', {exit: 1});
      }

      throw error;
    }

    const configToSave: {api_key: string; base_url?: string} = {api_key: token};
    if (this.flags['base-url']) {
      configToSave.base_url = baseUrl;
    }

    writeConfig(this.config.configDir, configToSave);

    if (!this.jsonEnabled()) {
      this.log('✓ Authenticated successfully. Key saved.');
    }

    return {success: true};
  }
}
