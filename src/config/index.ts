export { config, getGlobalConfig } from './global'

export interface Config {
  http: HttpConfig
  hooks: HooksConfig
  validation: ValidationConfig
}

export type PartialConfig = {
  http: HttpClient | 'default'
  hooks: HooksConfig
  validation: ValidationConfig
}

export class DecoratorConfig implements Config {
  private readonly _wrapped: Config
  private readonly _overrides: ConfigOverride

  public constructor(wrapped: Config, overrides: ConfigOverride) {
    this._wrapped = wrapped
    this._overrides = overrides
  }

  public get badResponseHandler(): BadResponseHandler {
    return this.overrideConfigProperty('badResponseHandler')
  }

  public get failedRequestHandler(): FailedRequestHandler {
    return this.overrideConfigProperty('failedRequestHandler')
  }

  private overrideConfigProperty<P extends keyof Config>(p: P): Config[P] {
    let finalValue: Config[P] = this._wrapped[p]

    const option: Config[P] | ResetValue | undefined = this._overrides[p]
    if (option === 'default') {
      finalValue = defaultConfig[p]
    } else if (option !== undefined) {
      finalValue = option
    }

    return finalValue
  }
}
