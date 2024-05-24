import { HttpClient, CreationResult } from '@module/backend'
import { jest } from '@jest/globals'

type Mock<R, P extends unknown[], T> = jest.Mock<(this: T, ...args: P) => R>

export interface FakeHttpClient extends HttpClient {
  getJson: Mock<Promise<unknown>, [URL], HttpClient>
  postJson: Mock<Promise<CreationResult>, [URL, unknown], HttpClient>
  putJson: Mock<Promise<void>, [URL, unknown], HttpClient>
  delete: Mock<Promise<void>, [URL], HttpClient>
}

export default function fakeHttpClient(): FakeHttpClient {
  return {
    getJson: jest.fn(),
    postJson: jest.fn(),
    putJson: jest.fn(),
    delete: jest.fn(),
  }
}
