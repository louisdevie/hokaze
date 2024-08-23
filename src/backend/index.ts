import type { AuthScheme } from '@module/auth'

export interface RequestBodyOrParams {
  intoBodyInit(): BodyInit | null
  readonly type: string | null
}

export interface ResponseBody {
  arrayBuffer(): Promise<ArrayBuffer>

  blob(): Promise<Blob>

  formData(): Promise<FormData>

  json(): Promise<unknown>

  text(): Promise<string>
}

export interface CreationResult {
  location: string | null
  responseBody: ResponseBody
}

export interface HttpClient {
  get(url: URL, expectedResponseType: string, headers?: Headers): Promise<ResponseBody>

  post(url: URL, payload: RequestBodyOrParams, expectedResponseType: string, headers?: Headers): Promise<CreationResult>

  put(url: URL, payload: RequestBodyOrParams, expectedResponseType: string, headers?: Headers): Promise<ResponseBody>

  delete(url: URL, expectedResponseType: string, headers?: Headers): Promise<ResponseBody>

  useAuth(auth: AuthScheme): void
}
export const AnyResponseType = '*/*'
export { FetchHttpClient as DefaultHttpClient } from './fetch'
