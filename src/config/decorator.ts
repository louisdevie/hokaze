import type { Config } from '.'

export type ResetValue = 'reset'

export type ConfigOverride = { [P in keyof Config]?: Config[P] | ResetValue }

export class DecoratorConfig implements Config {
  // private static readonly resetValue: ResetValue = 'reset'

  private readonly _wrapped: Config
  private readonly _overrides: ConfigOverride

  public constructor(wrapped: Config, overrides: ConfigOverride) {
    this._wrapped = wrapped
    this._overrides = overrides
  }

  /*private overrideConfigProperty<P extends keyof Config>(p: P): Config[P] {
    let finalValue: Config[P] = this._wrapped[p]

    const option: Config[P] | ResetValue | undefined = this._overrides[p]
    if (option === DecoratorConfig.resetValue) {
      finalValue = defaultConfig[p]
    } else if (option !== undefined) {
      finalValue = option
    }

    return finalValue
  }*/
}
