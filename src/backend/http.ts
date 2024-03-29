import { HttpClient } from '.'

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
}
