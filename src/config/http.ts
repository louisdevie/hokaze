import { createBrowserHttpClient, HttpClient } from '@module/http'

export type HttpConfig = HttpClient

export const DefaultHttpConfig = createBrowserHttpClient()

export type PartialHttpConfig = HttpClient

export function mergeHttpConfig(base: HttpConfig, override: PartialHttpConfig | undefined): HttpConfig {
  return override ?? base
}
