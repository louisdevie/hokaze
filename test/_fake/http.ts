import { HttpClient, PostResult } from '@module/backend'
import { jest } from '@jest/globals'

type Mock<R, P extends any[], T> = jest.Mock<(this: T, ...args: P) => R>

export interface FakeHttpClient extends HttpClient {
  getJson: Mock<Promise<any>, [URL], HttpClient>
  postJson: Mock<Promise<PostResult>, [URL, any], HttpClient>
  putJson: Mock<Promise<void>, [URL, any], HttpClient>
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
