import type { Key } from '@module/resources'
import type { UrlSearchArgs } from '@module/url'

export class UrlTemplate {
  private readonly _base: URL

  public constructor(baseUrl: string | URL) {
    if (typeof baseUrl === 'string') {
      this._base = new URL(baseUrl)
    } else {
      this._base = baseUrl
    }
    UrlTemplate.ensureTrailingSeparator(this._base)
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
    this.addSearchArgs(resourceUrl, args)
    return resourceUrl
  }

  public getUrlForItem(path: string, key: Key, args: UrlSearchArgs): URL {
    const itemUrl = this.getUrlForResource(path, {})
    itemUrl.pathname += `/${key}`
    this.addSearchArgs(itemUrl, args)
    return itemUrl
  }

  private addSearchArgs(url: URL, args: UrlSearchArgs): void {
    for (const name of Object.keys(args)) {
      const arg = args[name]
      if (arg === null) {
        url.searchParams.append(name, 'null')
      } else if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
        url.searchParams.append(name, arg.toString())
      } else if (arg !== undefined) {
        url.searchParams.append(name, '[object]')
      }
    }
  }
}
