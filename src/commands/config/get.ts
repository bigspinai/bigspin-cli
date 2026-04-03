import {Args} from '@oclif/core';

import {BaseCommand} from '../../base-command.js';
import {readConfig} from '../../config.js';
import type {CliConfig} from '../../types.js';
import {redactApiKey} from '../../utils.js';

const ACCEPTED_KEYS = ['api_key', 'base_url'] as const;
type ConfigKey = typeof ACCEPTED_KEYS[number];

function isAcceptedKey(key: string): key is ConfigKey {
  return (ACCEPTED_KEYS as readonly string[]).includes(key);
}

export default class ConfigGet extends BaseCommand<typeof ConfigGet> {
  static override description = 'Get a config value';

  static override examples = [
    '<%= config.bin %> config get base_url',
    '<%= config.bin %> config get api_key',
  ];

  static override args = {
    key: Args.string({
      description: 'Config key to get',
      required: true,
      options: [...ACCEPTED_KEYS],
    }),
  };

  public async run(): Promise<{key: string; value: string | null}> {
    const {key} = this.args;

    if (!isAcceptedKey(key)) {
      this.error(`Invalid config key "${key}". Accepted keys: ${ACCEPTED_KEYS.join(', ')}`, {exit: 1});
    }

    const config = readConfig(this.config.configDir);
    const value: string | undefined = config[key as keyof CliConfig];

    if (!value) {
      if (!this.jsonEnabled()) {
        this.log('(not set)');
      }

      return {key, value: null};
    }

    const displayValue = key === 'api_key' ? redactApiKey(value) : value;
    if (!this.jsonEnabled()) {
      this.log(displayValue);
    }

    return {key, value: displayValue};
  }
}
