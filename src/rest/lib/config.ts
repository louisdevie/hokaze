import { DefaultHttpConfig, HttpConfig, mergeHttpConfig, PartialHttpConfig } from '@module/http/config'
import {
  DefaultInterceptConfig,
  InterceptConfig,
  mergeInterceptConfig,
  PartialInterceptConfig,
} from '@module/interceptors/config'
import {
  DefaultValidationConfig,
  mergeValidationConfig,
  PartialValidationConfig,
  ValidationConfig,
} from '@module/validation/config'

export interface Config {
  intercept: InterceptConfig
  validation: ValidationConfig
  http: HttpConfig
}

let __glob__: Config = {
  intercept: DefaultInterceptConfig,
  validation: DefaultValidationConfig,
  http: DefaultHttpConfig,
}

export interface PartialConfig {
  intercept?: PartialInterceptConfig
  validation?: PartialValidationConfig
  http?: PartialHttpConfig
}

export function mergeConfig(base: Config, override: PartialConfig): Config {
  return {
    intercept: mergeInterceptConfig(base.intercept, override.intercept),
    validation: mergeValidationConfig(base.validation, override.validation),
    http: mergeHttpConfig(base.http, override.http),
  }
}

export function config(options: PartialConfig): void {
  __glob__ = mergeConfig(__glob__, options)
}

export function getGlobalConfig(): Config {
  return __glob__
}
