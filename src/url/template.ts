import type { Key } from '@module/resources'
import type { UrlSearchArgs, UrlSerializationBehavior } from '@module/url'
import { UrlSerializationImpl } from '@module/url/serialization'

export interface UrlTemplateOptions {
  readonly urlSerializationBehavior: UrlSerializationBehavior
}

export class UrlTemplate {
  private readonly _options: UrlTemplateOptions
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

  public get options(): UrlTemplateOptions {
    return this._options
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
        url.searchParams.append(name, UrlSerializationImpl[this._options.urlSerializationBehavior](arg))
      }
    }
  }
}
