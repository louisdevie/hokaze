import { UrlTemplate } from './url'
import { httpClient } from '@module/backend'
import { DefaultRequestPath, RequestPath } from '@module/requestPath'
import { ConfigOverride, DecoratorConfig } from '@module/config/decorator'
import type { AuthScheme } from '@module/auth'
import { getGlobalConfig } from '@module/config/global'

export interface Service extends RequestPath {
  useAuth(auth: AuthScheme): void
}

export interface ServiceOptions extends ConfigOverride {
  baseUrl: string | URL
  auth?: AuthScheme
}

export class DefaultService extends DefaultRequestPath implements Service {
  public useAuth(auth: AuthScheme): void {
    this.httpClient.useAuth(auth)
  }
}

export function service(init: string | URL | ServiceOptions): Service {
  if (typeof init === 'string' || init instanceof URL) {
    init = { baseUrl: init }
  }

  const service = new DefaultService({
    baseUrl: new UrlTemplate(init.baseUrl),
    httpClient: httpClient(new DecoratorConfig(getGlobalConfig(), init)),
  })

  if (init.auth !== undefined) {
    service.useAuth(init.auth)
  }

  return service
}
