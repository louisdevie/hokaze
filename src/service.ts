import { UrlTemplate } from './url'
import { DefaultHttpClient } from '@module/backend'
import { DefaultRequestPath, RequestPath } from '@module/requestPath'

export interface Service extends RequestPath {}

export interface ServiceOptions {
  baseUrl: string | URL
}

export function service(init: string | URL | ServiceOptions): Service {
  if (typeof init === 'string' || init instanceof URL) {
    init = { baseUrl: init }
  }

  return new DefaultRequestPath({ baseUrl: new UrlTemplate(init.baseUrl, {}), httpClient: new DefaultHttpClient() })
}
