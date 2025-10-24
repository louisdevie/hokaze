import type { CustomRequest } from '.'
import { AuthScheme } from '@module/auth'
import { HttpClient, HttpRequest } from '../http'
import { Mapper } from '@module/mappers'
import { NoRequestBody } from '@module/mappers/noRequestBody'
import { UrlTemplate } from '@module/url'

interface RequestParams<Q, R> {
  client: HttpClient
  baseUrl: UrlTemplate
  path: string
  requestMapper: Mapper<Q> | null
  responseMapper: Mapper<R> | null
}

export type GenericRequestInit<Q, R> = GenericCustomRequest<Q, R> | RequestParams<Q, R>

export interface RequestOptions {
  headers?: Headers
}

class GenericCustomRequest<Q, R> implements CustomRequest<Q, R> {
  private readonly _client: HttpClient
  private readonly _baseUrl: UrlTemplate
  private readonly _path: string
  private readonly _headers: Headers
  private readonly _requestMapper: Mapper<Q> | null
  private readonly _responseMapper: Mapper<R> | null

  public constructor(init: GenericRequestInit<Q, R>, options?: RequestOptions) {
    if (init instanceof GenericCustomRequest) {
      this._client = init._client
      this._baseUrl = init._baseUrl
      this._path = init._path
      this._headers = options?.headers ?? init._headers
      this._requestMapper = init._requestMapper
      this._responseMapper = init._responseMapper
    } else {
      this._client = init.client
      this._baseUrl = init.baseUrl
      this._path = init.path
      this._headers = new Headers()
      this._requestMapper = init.requestMapper
      this._responseMapper = init.responseMapper
    }
  }

  protected get client(): HttpClient {
    return this._client
  }

  protected get headers(): Headers {
    return this._headers
  }

  protected get expectedResponseType(): string {
    return this._responseMapper?.expectedResponseType ?? AnyResponseType
  }

  protected buildUrl(): URL {
    return this._baseUrl.getUrlForResource(this._path, {})
  }

  public async send(request: Q): Promise<R> {
    let mappedRequest: HttpRequest = new NoRequestBody()
    if (this._requestMapper !== null) {
      mappedRequest = this._requestMapper.pack(request)
    }

    const response = await this._client.send(mappedRequest)

    let mappedResponse = undefined
    if (this._responseMapper !== null) {
      mappedResponse = this._responseMapper.unpack(response)
    }>

    return mappedResponse as R
  }

  protected abstract cloneWithOptions(options: RequestOptions): CustomRequest<Q, R>

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
