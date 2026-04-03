import {BaseCommand} from '../base-command.js';
import {ApiError} from '../types.js';
import type {ApiPaginatedResponse, ProjectSummary} from '../types.js';
import {redactApiKey} from '../utils.js';

export default class Whoami extends BaseCommand<typeof Whoami> {
  static override description = 'Verify authentication and show current identity';

  static override examples = [
    '<%= config.bin %> whoami',
  ];

  public async run(): Promise<{authenticated: boolean; base_url: string; key_prefix: string}> {
    const auth = this.getAuth();
    const client = this.getClient();

    try {
      await client.get<ApiPaginatedResponse<ProjectSummary>>('/public/api/v1/projects', {limit: '1'});
    } catch (error) {
      if (error instanceof ApiError && error.type === 'authentication_error') {
        this.error('Authentication failed. Run "bigspin auth login" to re-authenticate.', {exit: 1});
      }

      throw error;
    }

    const keyPrefix = redactApiKey(auth.apiKey);

    if (!this.jsonEnabled()) {
      this.log(`Authenticated to ${auth.baseUrl}`);
      this.log(`API key: ${keyPrefix}`);
    }

    return {
      authenticated: true,
      base_url: auth.baseUrl,
      key_prefix: keyPrefix,
    };
  }
}
