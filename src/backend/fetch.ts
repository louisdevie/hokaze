import type { CreationResult, HttpClient, RequestBodyOrParams, ResponseBody } from '.'
import { AuthScheme } from '@module/auth'

/**
 * @internal
 */
export class FetchHttpClient implements HttpClient {
  private _globalAuth?: AuthScheme

  public get(url: URL, expectedResponseType: string, headers: Headers = new Headers()): Promise<ResponseBody> {
    headers.append('Accept', expectedResponseType)
    if (this._globalAuth !== undefined && !headers.has('Authorization')) {
      this._globalAuth.setupHeaders(headers)
    }
    return fetch(url, {
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

    const response = await fetch(url, {
      method: 'POST',
      body: payload.intoBodyInit(),
      headers,
    })

    return {
      responseBody: response,
      location: response.headers.get('Location'),
    }
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

    return fetch(url, {
      method: 'PUT',
      body: payload.intoBodyInit(),
      headers,
    })
  }

  public delete(url: URL, expectedResponseType: string, headers: Headers = new Headers()): Promise<ResponseBody> {
    if (this._globalAuth !== undefined && !headers.has('Authorization')) {
      this._globalAuth.setupHeaders(headers)
    }
    return fetch(url, {
      method: 'DELETE',
      headers,
    })
  }

  public useAuth(auth: AuthScheme) {
    this._globalAuth = auth
  }
}
