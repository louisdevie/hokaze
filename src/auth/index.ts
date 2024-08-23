export interface AuthScheme {
  setupHeaders(headers: Headers): void
}

export { BearerToken } from './bearer'
export { BasicAuth } from './basic'
