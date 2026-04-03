import {BaseCommand} from '../../base-command.js';
import {getConfigPath, readConfig} from '../../config.js';
import {redactApiKey} from '../../utils.js';

interface ConfigListResult {
  config_path: string;
  api_key: string | null;
  base_url: string | null;
}

export default class ConfigList extends BaseCommand<typeof ConfigList> {
  static override description = 'List all config values';

  static override examples = [
    '<%= config.bin %> config list',
  ];

  public async run(): Promise<ConfigListResult> {
    const config = readConfig(this.config.configDir);
    const configPath = getConfigPath(this.config.configDir);

    const apiKey = config.api_key ? redactApiKey(config.api_key) : null;
    const baseUrl = config.base_url ?? null;

    if (!this.jsonEnabled()) {
      this.log(`Config file: ${configPath}`);
      this.log('');
      this.log(`api_key:  ${apiKey ?? '(not set)'}`);
      this.log(`base_url: ${baseUrl ?? '(not set)'}`);
    }

    return {
      config_path: configPath,
      api_key: apiKey,
      base_url: baseUrl,
    };
  }
}
