import { UrlTemplate } from '@module/url'

export default function fakeResourceUrl(): UrlTemplate {
  return new UrlTemplate('https://my-api.com/v2')
}
