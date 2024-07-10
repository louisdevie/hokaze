import { DecoratorConfig } from '@module/config/decorator'
import { getGlobalConfig } from '@module/config/global'
import { DefaultRequestPath } from '@module/requestPath'
import { UrlTemplate } from '@module/url'
import { Service } from '@module/service'
import { FakeHttpClient } from './http'

export default function (url: string, http: FakeHttpClient): Service {
  const serviceConfig = new DecoratorConfig(getGlobalConfig(), {})

  return new DefaultRequestPath({
    baseUrl: new UrlTemplate(url, { urlSerializationBehavior: serviceConfig.objectSerializationInURL }),
    httpClient: http,
  })
}
