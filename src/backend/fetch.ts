import type { HttpClient, CreationResult } from '.'

/**
 * @internal
 */
export class FetchHttpClient implements HttpClient {
  public async getJson(url: URL): Promise<unknown> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    return (await response.json()) as unknown
  }

  public async postJson(url: URL, payload: unknown): Promise<CreationResult> {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Accept: '*/*',
        ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
    })

    let responseBody
    try {
      responseBody = (await response.json()) as unknown
    } catch {
      responseBody = undefined
    }

    return { responseBody, location: response.headers.get('Location') }
  }

  public async putJson(url: URL, payload: unknown, ignoreResponse = true): Promise<unknown> {
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })

    if (!ignoreResponse) {
      let responseBody
      try {
        responseBody = (await response.json()) as unknown
      } catch {
        responseBody = undefined
      }

      return responseBody
    }
  }

  public async delete(url: URL, ignoreResponse = true): Promise<unknown> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
      },
    })

    if (!ignoreResponse) {
      let responseBody
      try {
        responseBody = (await response.json()) as unknown
      } catch {
        responseBody = undefined
      }

      return responseBody
    }
  }
}
