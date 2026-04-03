import {Command, Flags, Interfaces} from '@oclif/core';

import {resolveAuth} from './auth.js';
import {BigspinClient} from './client.js';
import {ApiError} from './types.js';
import type {ResolvedAuth} from './auth.js';

export type InferredFlags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>;
export type InferredArgs<T extends typeof Command> = Interfaces.InferredArgs<T['args']>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static enableJsonFlag = true;

  static baseFlags = {
    'api-key': Flags.string({
      description: 'API key for authentication',
      env: 'BIGSPIN_API_KEY',
      hidden: true,
    }),
    'base-url': Flags.string({
      description: 'API base URL',
      env: 'BIGSPIN_BASE_URL',
      helpGroup: 'GLOBAL',
    }),
  };

  protected flags!: InferredFlags<T>;
  protected args!: InferredArgs<T>;

  public async init(): Promise<void> {
    await super.init();
    const {args, flags} = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
    this.flags = flags as InferredFlags<T>;
    this.args = args as InferredArgs<T>;
  }

  protected getAuth(): ResolvedAuth {
    return resolveAuth(this.flags as {'api-key'?: string; 'base-url'?: string}, this.config.configDir);
  }

  protected getClient(): BigspinClient {
    const auth = this.getAuth();
    return new BigspinClient(auth.baseUrl, auth.apiKey, this.config.version);
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<unknown> {
    if (err instanceof ApiError) {
      this.error(`${err.message} (${err.type})`, {exit: 1});
    }

    return super.catch(err);
  }
}
