import {Args} from '@oclif/core';

import {BaseCommand} from '../../base-command.js';
import {writeConfig} from '../../config.js';
import type {CliConfig} from '../../types.js';
import {redactApiKey} from '../../utils.js';

const ACCEPTED_KEYS = ['api_key', 'base_url'] as const;
type ConfigKey = typeof ACCEPTED_KEYS[number];

function isAcceptedKey(key: string): key is ConfigKey {
  return (ACCEPTED_KEYS as readonly string[]).includes(key);
}

export default class ConfigSet extends BaseCommand<typeof ConfigSet> {
  static override description = 'Set a config value';

  static override examples = [
    '<%= config.bin %> config set base_url https://staging.bigspin.ai',
    '<%= config.bin %> config set api_key sk-bigspin-api03-...',
  ];

  static override args = {
    key: Args.string({
      description: 'Config key to set',
      required: true,
      options: [...ACCEPTED_KEYS],
    }),
    value: Args.string({
      description: 'Value to set',
      required: true,
    }),
  };

  public async run(): Promise<{key: string; value: string}> {
    const {key, value} = this.args;

    if (!isAcceptedKey(key)) {
      this.error(`Invalid config key "${key}". Accepted keys: ${ACCEPTED_KEYS.join(', ')}`, {exit: 1});
    }

    if (key === 'api_key' && !/^sk-(bigspin|prism)-api/.test(value)) {
      this.error('Invalid API key format. Key must start with "sk-bigspin-api" or "sk-prism-api".', {exit: 1});
    }

    const partial: Partial<CliConfig> = {[key]: value};
    writeConfig(this.config.configDir, partial);

    const displayValue = key === 'api_key' ? redactApiKey(value) : value;
    if (!this.jsonEnabled()) {
      this.log(`Set ${key} = ${displayValue}`);
    }

    return {key, value: displayValue};
  }
}
