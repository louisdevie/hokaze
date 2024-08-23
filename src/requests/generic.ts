import type { CustomRequest } from '.'
import { AnyResponseType, HttpClient, RequestBodyOrParams, ResponseBody } from '@module/backend'
import { UrlTemplate } from '@module/url'
import { Mapper } from '@module/mappers'
import { NoRequestBody } from '@module/mappers/noRequestBody'
import * as URL from 'node:url'
import { AuthScheme } from '@module/auth'

interface RequestParams<Q, R> {
  client: HttpClient
  baseUrl: UrlTemplate
  path: string
  requestMapper: Mapper<Q> | null
  responseMapper: Mapper<R> | null
}

export type GenericRequestInit<Q, R> = GenericBaseRequest<Q, R> | RequestParams<Q, R>

export interface RequestOptions {
  headers?: Headers
}

abstract class GenericBaseRequest<Q, R> implements CustomRequest<Q, R> {
  private readonly _client: HttpClient
  private readonly _baseUrl: UrlTemplate
  private readonly _path: string
  private readonly _headers: Headers
  private readonly _requestMapper: Mapper<Q> | null
  private readonly _responseMapper: Mapper<R> | null

  public constructor(init: GenericRequestInit<Q, R>, options?: RequestOptions) {
    if (init instanceof GenericBaseRequest) {
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

  protected abstract sendRaw(request: RequestBodyOrParams): Promise<ResponseBody>

  public async send(request: Q): Promise<R> {
    let mappedRequest: RequestBodyOrParams = new NoRequestBody()
    if (this._requestMapper !== null) {
      mappedRequest = this._requestMapper.pack(request)
    }

    const response = await this.sendRaw(mappedRequest)

    let mappedResponse = undefined
    if (this._responseMapper !== null) {
      mappedResponse = this._responseMapper.unpack(response)
    }

    return mappedResponse as R
  }

  protected abstract cloneWithOptions(options: RequestOptions): CustomRequest<Q, R>

  public withHeaders(init: HeadersInit): CustomRequest<Q, R> {
    const newHeaders = new Headers(this._headers)
    const headersToAppend = new Headers(init)
    headersToAppend.forEach((value, key) => newHeaders.append(key, value))
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
    keys.forEach((key) => newHeaders.delete(key))
    return this.cloneWithOptions({ headers: newHeaders })
  }
}

export class GenericGetRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected sendRaw(): Promise<ResponseBody> {
    return this.client.get(this.buildUrl(), this.expectedResponseType, this.headers)
  }

  protected cloneWithOptions(options: RequestOptions): CustomRequest<Q, R> {
    return new GenericGetRequest(this, options)
  }
}

export class GenericPostRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected async sendRaw(request: RequestBodyOrParams): Promise<ResponseBody> {
    const creationResult = await this.client.post(this.buildUrl(), request, this.expectedResponseType, this.headers)
    return creationResult.responseBody
  }

  protected cloneWithOptions(options: RequestOptions): CustomRequest<Q, R> {
    return new GenericPostRequest(this, options)
  }
}

export class GenericPutRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected sendRaw(request: RequestBodyOrParams): Promise<ResponseBody> {
    return this.client.put(this.buildUrl(), request, this.expectedResponseType, this.headers)
  }

  protected cloneWithOptions(options: RequestOptions): CustomRequest<Q, R> {
    return new GenericPutRequest(this, options)
  }
}

export class GenericDeleteRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected sendRaw(): Promise<ResponseBody> {
    return this.client.delete(this.buildUrl(), this.expectedResponseType, this.headers)
  }

  protected cloneWithOptions(options: RequestOptions): CustomRequest<Q, R> {
    return new GenericDeleteRequest(this, options)
  }
}
