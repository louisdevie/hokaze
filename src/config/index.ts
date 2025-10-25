import { DefaultHooksConfig, HooksConfig, mergeHooksConfig, PartialHooksConfig } from './hooks'
import { DefaultHttpConfig, HttpConfig, mergeHttpConfig, PartialHttpConfig } from './http'
import { DefaultValidationConfig, mergeValidationConfig, PartialValidationConfig, ValidationConfig } from './validation'

export interface Config {
  http: HttpConfig
  hooks: HooksConfig
  validation: ValidationConfig
}

let __glob__: Config = {
  http: DefaultHttpConfig,
  hooks: DefaultHooksConfig,
  validation: DefaultValidationConfig,
}

export interface PartialConfig {
  http?: PartialHttpConfig
  hooks?: PartialHooksConfig
  validation?: PartialValidationConfig
}

export function mergeConfig(base: Config, override: PartialConfig): Config {
  return {
    http: mergeHttpConfig(base.http, override.http),
    hooks: mergeHooksConfig(base.hooks, override.hooks),
    validation: mergeValidationConfig(base.validation, override.validation),
  }
}

export function config(options: PartialConfig): void {
  __glob__ = mergeConfig(__glob__, options)
}

export function getGlobalConfig(): Config {
  return __glob__
}
