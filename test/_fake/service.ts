import { FakeHttpClient } from './http'
import { DefaultService, Service } from '@module/service'
import { UrlTemplate } from '@module/url'

export default function (url: string, http: FakeHttpClient): Service {
  return new DefaultService({
    baseUrl: new UrlTemplate(url),
    httpClient: http,
  })
}
