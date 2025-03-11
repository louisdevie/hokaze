import type { Config, BadResponseHandler, FailedRequestHandler } from '.'
import { ConfigOverride, DecoratorConfig } from '@module/config/decorator'
import { defaultConfig } from '@module/config/default'

class GlobalConfig implements Config {
  private _current: Config

  public constructor() {
    this._current = defaultConfig
  }

  public set(options: ConfigOverride): void {
    this._current = new DecoratorConfig(defaultConfig, options)
  }

  public get badResponseHandler(): BadResponseHandler {
    return this._current.badResponseHandler
  }

  public get failedRequestHandler(): FailedRequestHandler {
    return this._current.failedRequestHandler
  }
}

const __glob__ = new GlobalConfig()

export function globalConfig(options: ConfigOverride): void {
  __glob__.set(options)
}

export function getGlobalConfig(): Config {
  return __glob__
}
