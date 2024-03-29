import { Key } from './resources'

export interface UrlTemplateOptions {}

export type UrlSearchArgs = Record<string, any>

export class UrlTemplate {
  private _options: UrlTemplateOptions
  private readonly _base: URL

  public constructor(baseUrl: string | URL, options: UrlTemplateOptions) {
    if (typeof baseUrl === 'string') {
      this._base = new URL(baseUrl)
    } else {
      this._base = baseUrl
    }
    UrlTemplate.ensureTrailingSeparator(this._base)

    this._options = options
  }

  private static ensureTrailingSeparator(url: URL): void {
    if (!url.pathname.endsWith('/')) {
      url.pathname += '/'
    }
  }

  private static stripTrailingSeparator(url: URL): void {
    if (url.pathname.endsWith('/')) {
      url.pathname = url.pathname.substring(0, url.pathname.length - 1)
    }
  }

  public getUrlForResource(path: string, args: UrlSearchArgs): URL {
    const resourceUrl = new URL(path, this._base)
    UrlTemplate.stripTrailingSeparator(resourceUrl)
    UrlTemplate.addSearchArgs(resourceUrl, args)
    return resourceUrl
  }

  public getUrlForItem(path: string, key: Key, args: UrlSearchArgs): URL {
    const itemUrl = this.getUrlForResource(path, {})
    itemUrl.pathname += '/' + key
    UrlTemplate.addSearchArgs(itemUrl, args)
    return itemUrl
  }

  private static addSearchArgs(url: URL, args: UrlSearchArgs): void {
    for (const name in args) {
      if (args[name] === null) {
        url.searchParams.append(name, 'null')
      } else if (args[name] !== undefined) {
        url.searchParams.append(name, args[name].toString())
      }
    }
  }
}
