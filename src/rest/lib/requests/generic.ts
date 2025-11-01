import type { PreparedRequest } from '.'
import { Config, getGlobalConfig, mergeConfig, PartialConfig } from '@module/config'
import type { Mapper } from '@module/mappers'

/**
 * @internal
 */
export interface GenericPreparedRequestInit<Q, R> {
  method: string
  url: URL
  requestMapper: Mapper<Q> | null
  responseMapper: Mapper<R> | null
}

/**
 * @internal
 */
export interface GenericPreparedRequestOptions {}

/**
 * @internal
 */
export class GenericPreparedRequest<Q, R> implements PreparedRequest<Q, R> {
  private readonly _config: Config
  private readonly _method: string
  private readonly _url: URL
  private readonly _requestMapper: Mapper<Q> | null
  private readonly _responseMapper: Mapper<R> | null

  public constructor(
    init: GenericPreparedRequest<Q, R> | GenericPreparedRequestInit<Q, R>,
    options?: GenericPreparedRequestOptions,
  ) {
    if (init instanceof GenericPreparedRequest) {
      this._config = init._config
      this._method = init._method
      this._url = init._url
      this._requestMapper = init._requestMapper
      this._responseMapper = init._responseMapper
    } else {
      this._config = mergeConfig(getGlobalConfig(), init.config)
      this._method = init.method
      this._url = init.url
      this._requestMapper = init.requestMapper
      this._responseMapper = init.responseMapper
    }
  }

  public get method(): string {
    return this._method
  }

  public get url(): URL {
    return this._url
  }

  public async send(request: Q): Promise<R> {
    if (this._requestMapper !== null) {
      request = this._config.hooks.onBeforePacking(request)
      hrb.withContent(this._requestMapper.pack(request))
    }
    if (this._responseMapper !== null) {
      hrb.withExpectedResponseType(this._responseMapper.expectedResponseType)
    }

    const response = await this._config.http.request(hrb.build())

    let mappedResponse = undefined
    if (this._responseMapper !== null) {
      mappedResponse = this._responseMapper.unpack(response)
    }

    return mappedResponse as R
  }

  public withHeaders(init: HeadersInit): CustomRequest<Q, R> {
    const newHeaders = new Headers(this._headers)
    const headersToAppend = new Headers(init)
    headersToAppend.forEach((value, key) => {
      newHeaders.append(key, value)
    })
    return this.cloneWithOptions({ headers: newHeaders })
  }

  public withAuth(auth: AuthScheme | string): CustomRequest<Q, R> {
    const newHeaders = new Headers(this._headers)
    if (typeof auth === 'string') {
      newHeaders.append('Authorization', auth)
    } else {
      auth.setupHeaders(newHeaders)
    }
    return this.cloneWithOptions({ headers: newHeaders })
  }

  public withExactHeaders(init: HeadersInit): CustomRequest<Q, R> {
    const headers = new Headers(init)
    return this.cloneWithOptions({ headers })
  }

  public withoutHeaders(...keys: string[]): CustomRequest<Q, R> {
    const newHeaders = new Headers(this._headers)
    for (const key of keys) newHeaders.delete(key)
    return this.cloneWithOptions({ headers: newHeaders })
  }
}
