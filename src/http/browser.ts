import type { HttpClient, HttpRequest, HttpResponse } from '.'
import { AuthScheme } from '@module/auth'
import { Config, Hooks } from '@module/config'
import { throwInternal } from '@module/errors'

/**
 * @internal
 */
export class BrowserHttpClient implements HttpClient {
  public async send(request: HttpRequest, hooks: Hooks): Promise<HttpResponse> {
    let response
    try {
      response = await fetch(request)
    } catch (error) {
      response = await hooks.onFailedRequest(error)
    }
    if (!response.ok) {
      response = hooks.onBadResponse(response)
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
    super(`${response.status} ${response.statusText}`)
    if (response.ok) throwInternal('BadResponse constructor called with ok response')
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
