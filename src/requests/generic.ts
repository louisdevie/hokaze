import type { CustomRequest, RequestParams, RequestReturn } from '.'
import type { HttpClient } from '@module/backend'
import type { UrlSearchArgs, UrlTemplate } from '@module/url'
import type { Mapper } from '@module/resources/mappers'

export type OptionalMapper<T> = Mapper<NonNullable<unknown>, NonNullable<T>> | undefined

abstract class GenericBaseRequest<Q extends RequestParams, R extends RequestReturn> implements CustomRequest<Q, R> {
  private readonly _client: HttpClient
  private readonly _baseUrl: UrlTemplate
  private readonly _path: string
  private readonly _requestMapper: OptionalMapper<Q[0]>
  private readonly _responseMapper: OptionalMapper<R>

  public constructor(
    client: HttpClient,
    baseUrl: UrlTemplate,
    path: string,
    requestMapper: OptionalMapper<Q[0]>,
    responseMapper: OptionalMapper<R>,
  ) {
    this._client = client
    this._baseUrl = baseUrl
    this._path = path
    this._requestMapper = requestMapper
    this._responseMapper = responseMapper
  }

  protected get client(): HttpClient {
    return this._client
  }

  protected buildUrl(args?: unknown): URL {
    return this._baseUrl.getUrlForResource(this._path, (args ?? {}) as UrlSearchArgs)
  }

  protected abstract sendRaw(request: unknown, ignoreResponse: boolean): Promise<unknown>

  public async send(...request: Q): Promise<R> {
    let mappedRequest = undefined
    if (this._requestMapper !== undefined && request.length !== 0) {
      mappedRequest = this._requestMapper.packItem(request[0])
      if (!mappedRequest.success) {
        throw new Error(mappedRequest.error)
      }
    }

    const response = await this.sendRaw(mappedRequest?.value, this._responseMapper === undefined)

    let mappedResponse = undefined
    if (this._responseMapper !== undefined && response !== undefined) {
      mappedResponse = this._responseMapper.unpackItem(response)
      if (!mappedResponse.success) {
        throw new Error(mappedResponse.error)
      }
    }

    return mappedResponse?.value as R
  }
}

export class GenericGetRequest<Q extends RequestParams, R extends RequestReturn> extends GenericBaseRequest<Q, R> {
  protected sendRaw(request: unknown): Promise<unknown> {
    return this.client.getJson(this.buildUrl(request))
  }
}

export class GenericPostRequest<Q extends RequestParams, R extends RequestReturn> extends GenericBaseRequest<Q, R> {
  protected async sendRaw(request: unknown): Promise<unknown> {
    const creationResult = await this.client.postJson(this.buildUrl(), request)
    return creationResult.responseBody
  }
}

export class GenericPutRequest<Q extends RequestParams, R extends RequestReturn> extends GenericBaseRequest<Q, R> {
  protected sendRaw(request: unknown, ignoreResponse: boolean): Promise<unknown> {
    return this.client.putJson(this.buildUrl(), request, ignoreResponse)
  }
}

export class GenericDeleteRequest<Q extends RequestParams, R extends RequestReturn> extends GenericBaseRequest<Q, R> {
  protected sendRaw(request: unknown, ignoreResponse: boolean): Promise<unknown> {
    return this.client.delete(this.buildUrl(request), ignoreResponse)
  }
}
