import { DefaultRequestPath } from '@module/requestPath'
import { UrlTemplate } from '@module/url'
import { Service } from '@module/service'
import { FakeHttpClient } from './http'

export default function (url: string, http: FakeHttpClient): Service {

  return new DefaultRequestPath({
    baseUrl: new UrlTemplate(url),
    httpClient: http,
  })
}
