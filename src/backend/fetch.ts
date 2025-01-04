import type { CreationResult, HttpClient, RequestBodyOrParams, ResponseBody } from '.'
import { AuthScheme } from '@module/auth'
import { Config } from '@module/config'
import { Err, internal } from '@module/errors'

/**
 * @internal
 */
export class FetchHttpClient implements HttpClient {
  private _config: Config

  public constructor(config: Config) {
    this._config = config
  }

  private _globalAuth?: AuthScheme

  private async fetch(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response> {
    let response = await fetch(input, init)
    if (!response.ok) {
      const processedResponse = this._config.badResponseHandler.onBadResponse(response)
      if (processedResponse instanceof Promise) {
        response = await processedResponse
      } else {
        response = processedResponse
      }
    }
    return response
  }

  public get(url: URL, expectedResponseType: string, headers: Headers = new Headers()): Promise<ResponseBody> {
    headers.append('Accept', expectedResponseType)
    if (this._globalAuth !== undefined && !headers.has('Authorization')) {
      this._globalAuth.setupHeaders(headers)
    }
    return this.fetch(url, {
      method: 'GET',
      headers,
    })
  }

  public async post(
    url: URL,
    payload: RequestBodyOrParams,
    expectedResponseType: string,
    headers: Headers = new Headers(),
  ): Promise<CreationResult> {
    headers.append('Accept', expectedResponseType)
    if (payload.type !== null) {
      headers.append('Content-Type', payload.type)
    }
    if (this._globalAuth !== undefined && !headers.has('Authorization')) {
      this._globalAuth.setupHeaders(headers)
    }

    const response = await this.fetch(url, {
      method: 'POST',
      body: payload.intoBodyInit(),
      headers,
    })

    return { responseBody: response, location: response.headers.get('Location') }
  }

  public put(
    url: URL,
    payload: RequestBodyOrParams,
    expectedResponseType: string,
    headers: Headers = new Headers(),
  ): Promise<ResponseBody> {
    headers.append('Accept', expectedResponseType)
    if (payload.type !== null) {
      headers.append('Content-Type', payload.type)
    }
    if (this._globalAuth !== undefined && !headers.has('Authorization')) {
      this._globalAuth.setupHeaders(headers)
    }

    return this.fetch(url, {
      method: 'PUT',
      body: payload.intoBodyInit(),
      headers,
    })
  }

  public delete(url: URL, expectedResponseType: string, headers: Headers = new Headers()): Promise<ResponseBody> {
    if (this._globalAuth !== undefined && !headers.has('Authorization')) {
      this._globalAuth.setupHeaders(headers)
    }
    return this.fetch(url, {
      method: 'DELETE',
      headers,
    })
  }

  public useAuth(auth: AuthScheme): void {
    this._globalAuth = auth
  }
}

export class BadResponse extends Error implements Response {
  private _originalResponse: Response

  public constructor(response: Response) {
    super('Bad response')
    if (response.ok) internal(Err.triedToThrowOkResponse)
    this._originalResponse = response
  }

  public get body(): ReadableStream<Uint8Array> | null {
    return this._originalResponse.body
  }

  public get bodyUsed(): boolean {
    return this._originalResponse.bodyUsed
  }

  public get headers(): Headers {
    return this._originalResponse.headers
  }

  public get ok(): boolean {
    return false
  }

  public get redirected(): boolean {
    return this._originalResponse.redirected
  }

  public get status(): number {
    return this._originalResponse.status
  }

  public get statusText(): string {
    return this._originalResponse.statusText
  }

  public get type(): ResponseType {
    return this._originalResponse.type
  }

  public get url(): string {
    return this._originalResponse.url
  }

  public arrayBuffer(): Promise<ArrayBuffer> {
    return this._originalResponse.arrayBuffer()
  }

  public blob(): Promise<Blob> {
    return this._originalResponse.blob()
  }

  public clone(): Response {
    return new BadResponse(this._originalResponse.clone())
  }

  public formData(): Promise<FormData> {
    return this._originalResponse.formData()
  }

  public json(): Promise<unknown> {
    return this._originalResponse.json()
  }

  public text(): Promise<string> {
    return this._originalResponse.text()
  }
}
