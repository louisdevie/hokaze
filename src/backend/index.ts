export interface PostResult {
  location: string
  responseBody: any
}

export interface HttpClient {
  getJson(url: URL): Promise<any>
  
  postJson(url: URL, payload: any): Promise<PostResult>
}

export { FetchHttpClient as DefaultHttpClient } from './http'
