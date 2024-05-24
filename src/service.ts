import { UrlTemplate } from './url'
import { DefaultHttpClient } from '@module/backend'
import { DefaultRequestPath, RequestPath } from '@module/requestPath'
import { ConfigOverride, DecoratorConfig } from '@module/config/decorator'
import { getGlobalConfig } from '@module/config/global'

export interface Service extends RequestPath {}

export interface ServiceOptions extends ConfigOverride {
  baseUrl: string | URL
}

export function service(init: string | URL | ServiceOptions): Service {
  if (typeof init === 'string' || init instanceof URL) {
    init = { baseUrl: init }
  }

  const serviceConfig = new DecoratorConfig(getGlobalConfig(), init)

  return new DefaultRequestPath({
    baseUrl: new UrlTemplate(init.baseUrl, { urlSerializationBehavior: serviceConfig.objectSerializationInURL }),
    httpClient: new DefaultHttpClient(),
  })
}
