import type { HttpClient, PostResult } from '.'

/**
 * @internal
 */
export class FetchHttpClient implements HttpClient {
  public async getJson(url: URL): Promise<any> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    return await response.json()
  }

  public async postJson(url: URL, payload: any): Promise<PostResult> {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })

    let responseBody
    try {
      responseBody = await response.json()
    } catch {
      responseBody = undefined
    }

    return { responseBody, location: response.headers.get('Location') }
  }

  public async putJson(url: URL, payload: any): Promise<void> {
    await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  public async delete(url: URL): Promise<void> {
    await fetch(url, { method: 'DELETE' })
  }
}
