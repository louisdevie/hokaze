import { jest } from '@jest/globals'
import { HttpClient, CreationResult, RequestBodyOrParams, ResponseBody } from '@module/backend'

type Mock<R, P extends unknown[], T> = jest.Mock<(this: T, ...args: P) => R>

export interface FakeHttpClient extends HttpClient {
  get: Mock<Promise<ResponseBody>, [URL, string], HttpClient>
  post: Mock<Promise<CreationResult>, [URL, RequestBodyOrParams, string], HttpClient>
  put: Mock<Promise<ResponseBody>, [URL, RequestBodyOrParams, string], HttpClient>
  delete: Mock<Promise<ResponseBody>, [URL, string], HttpClient>
}

export default function fakeHttpClient(): FakeHttpClient {
  return {
    useAuth(): void {},
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}
