import { fakeHttpClient, fakeService } from '@fake'
import { number, string } from '@module'

describe('creating a GET request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('http://some-api.com/', http)

  test('without arguments', async () => {
    const req = ws.getRequest({ path: '/foo/bar', response: ['a', 'b', 'c'] })

    http.getJson.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
    const res = await req.send()

    expect(http.getJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'))
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  test('with arguments', async () => {
    const req = ws.getRequest({ path: '/foo/baz', request: { x: string, y: number }, response: ['a', 'b', 'c'] })

    http.getJson.mockClear()
    http.getJson.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.getJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/baz?x=a&y=7'))
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('creating a POST request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('http://some-api.com/', http)

  test('without a request or response body', async () => {
    const req = ws.postRequest({ path: '/foo/bar' })

    http.postJson.mockResolvedValueOnce({ responseBody: undefined, location: null })
    await req.send()

    expect(http.postJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'))
  })

  test('with a request and no response body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', request: { x: string, y: number } })

    http.postJson.mockClear()
    http.postJson.mockResolvedValueOnce({ responseBody: undefined, location: null })
    await req.send({ x: 'a', y: 7 })

    expect(http.postJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), { x: 'a', y: 7 })
  })

  test('with a response and no request body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', response: ['a', 'b', 'c'] })

    http.postJson.mockClear()
    http.postJson.mockResolvedValueOnce({ responseBody: { a: 1, b: 2, c: 3, d: 4 }, location: null })
    const res = await req.send()

    expect(http.postJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'))
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  test('with both a request and response body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', request: { x: string, y: number }, response: ['a', 'b', 'c'] })

    http.postJson.mockClear()
    http.postJson.mockResolvedValueOnce({ responseBody: { a: 1, b: 2, c: 3, d: 4 }, location: null })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.postJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), { x: 'a', y: 7 })
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('creating a PUT request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('http://some-api.com/', http)

  test('without a request or response body', async () => {
    const req = ws.putRequest({ path: '/foo/bar' })

    http.putJson.mockResolvedValueOnce({ responseBody: undefined, location: null })
    await req.send()

    expect(http.putJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), undefined, true)
  })

  test('with a request and no response body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', request: { x: string, y: number } })

    http.putJson.mockClear()
    http.putJson.mockResolvedValueOnce({ responseBody: undefined, location: null })
    await req.send({ x: 'a', y: 7 })

    expect(http.putJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), { x: 'a', y: 7 }, true)
  })

  test('with a response and no request body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', response: ['a', 'b', 'c'] })

    http.putJson.mockClear()
    http.putJson.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
    const res = await req.send()

    expect(http.putJson).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), undefined, false)
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  test('with both a request and response body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', request: { x: string, y: number }, response: ['a', 'b', 'c'] })

    http.putJson.mockClear()
    http.putJson.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.putJson).toHaveBeenCalledExactlyOnceWith(
      new URL('http://some-api.com/foo/bar'),
      { x: 'a', y: 7 },
      false,
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('creating a DELETE request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('http://some-api.com/', http)

  test('without arguments or response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar' })

    http.delete.mockResolvedValueOnce({ responseBody: undefined, location: null })
    await req.send()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), true)
  })

  test('with arguments and no response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar', request: { x: string, y: number } })

    http.delete.mockClear()
    http.delete.mockResolvedValueOnce({ responseBody: undefined, location: null })
    await req.send({ x: 'a', y: 7 })

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar?x=a&y=7'), true)
  })

  test('with a response body and no arguments', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar', response: ['a', 'b', 'c'] })

    http.delete.mockClear()
    http.delete.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
    const res = await req.send()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar'), false)
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  test('with both arguments and a response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar', request: { x: string, y: number }, response: ['a', 'b', 'c'] })

    http.delete.mockClear()
    http.delete.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('http://some-api.com/foo/bar?x=a&y=7'), false)
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})
