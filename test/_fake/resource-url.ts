import { UrlTemplate } from '@module/url'
import { testUrlTemplateOptions } from '@data'

export default function fakeResourceUrl(): UrlTemplate {
  return new UrlTemplate('https://my-api.com/v2', testUrlTemplateOptions)
}
