import type { CustomRequest } from '.'
import {AnyResponseType, HttpClient, RequestBodyOrParams, ResponseBody} from '@module/backend'
import type { UrlTemplate } from '@module/url'
import {Mapper} from "@module/mappers";
import {NoRequestBody} from "@module/mappers/noRequestBody";

abstract class GenericBaseRequest<Q, R> implements CustomRequest<Q, R> {
  private readonly _client: HttpClient
  private readonly _baseUrl: UrlTemplate
  private readonly _path: string
  private readonly _requestMapper: Mapper<Q> | null
  private readonly _responseMapper: Mapper<R> | null

  public constructor(
    client: HttpClient,
    baseUrl: UrlTemplate,
    path: string,
    requestMapper: Mapper<Q> | null,
    responseMapper: Mapper<R> | null,
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
}

export class GenericGetRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected sendRaw(): Promise<ResponseBody> {
    return this.client.get(this.buildUrl(), this.expectedResponseType)
  }
}

export class GenericPostRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected async sendRaw(request: RequestBodyOrParams): Promise<ResponseBody> {
    const creationResult = await this.client.post(this.buildUrl(), request, this.expectedResponseType)
    return creationResult.responseBody
  }
}

export class GenericPutRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected sendRaw(request: RequestBodyOrParams): Promise<ResponseBody> {
    return this.client.put(this.buildUrl(), request, this.expectedResponseType)
  }
}

export class GenericDeleteRequest<Q, R> extends GenericBaseRequest<Q, R> {
  protected sendRaw(): Promise<ResponseBody> {
    return this.client.delete(this.buildUrl(), this.expectedResponseType)
  }
}
