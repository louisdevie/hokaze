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

    for (const name in args) {
      if (args[name] === null) {
        resourceUrl.searchParams.append(name, 'null')
      } else if (args[name] !== undefined) {
        resourceUrl.searchParams.append(name, args[name].toString())
      }
    }

    return resourceUrl
  }
}
