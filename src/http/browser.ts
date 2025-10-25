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
