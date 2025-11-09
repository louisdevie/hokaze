import { createFetchHttpClient, HttpClient } from '.'

export type HttpConfig = HttpClient

export const DefaultHttpConfig = createFetchHttpClient()

export type PartialHttpConfig = HttpClient

export function mergeHttpConfig(base: HttpConfig, override: PartialHttpConfig | undefined): HttpConfig {
  return override ?? base
}
