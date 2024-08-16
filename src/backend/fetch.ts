import type { CreationResult, HttpClient, RequestBodyOrParams, ResponseBody } from '.'

/**
 * @internal
 */
export class FetchHttpClient implements HttpClient {
  public get(url: URL, expectedResponseType: string): Promise<ResponseBody> {
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: expectedResponseType,
      },
    })
  }

  public async post(url: URL, payload: RequestBodyOrParams, expectedResponseType: string): Promise<CreationResult> {
    const headers = new Headers({ Accept: expectedResponseType })
    if (payload.type !== null) headers.append('Content-Type', payload.type)

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

  public put(url: URL, payload: RequestBodyOrParams, expectedResponseType: string): Promise<ResponseBody> {
    const headers = new Headers({ Accept: expectedResponseType })
    if (payload.type !== null) headers.append('Content-Type', payload.type)

    return fetch(url, {
      method: 'PUT',
      body: payload.intoBodyInit(),
      headers,
    })
  }

  public delete(url: URL, expectedResponseType: string): Promise<ResponseBody> {
    return fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: expectedResponseType,
      },
    })
  }
}
