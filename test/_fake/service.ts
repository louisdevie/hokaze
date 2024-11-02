import { UrlTemplate } from '@module/url'
import { DefaultService, Service } from '@module/service'
import { FakeHttpClient } from './http'

export default function (url: string, http: FakeHttpClient): Service {
  return new DefaultService({
    baseUrl: new UrlTemplate(url),
    httpClient: http,
  })
}
