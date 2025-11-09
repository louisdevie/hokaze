import { fakeHttpClient } from '@fake'
import { createWebService, json } from '@module'
import { createRequest } from '@module/requests/factory'

const abcObject = json.object({ a: json.number, b: json.number, c: json.number })
const xyObject = json.object({ x: json.string, y: json.number })

describe('creating a stand-alone request', () => {
  describe('creating a GET request', () => {
    test('without URL parameters', async () => {
      const http = fakeHttpClient()
      const request = createRequest({
        method: 'GET',
        path: '/foo/bar',
        response: abcObject,
      })
      const request2 = createRequest({
        GET: '/foo/bar',
        response: abcObject,
      })

      http.get.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
      const res = await ws.request.send()

      expect(http.get).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/foo/bar'),
        'application/json',
        new Headers(),
      )
      expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
    })

    // NOT YET SUPPORTED
    /*test('with URL parameters', async () => {
    const req = ws.getRequest({
      path: '/foo/baz',
      request: xyObject,
      response: abcObject,
    })

    http.getJson.mockClear()
    http.getconfig: string | URL | WebServiceConfig, p0: { request: { method: string; path: string; response: import("/home/louis/Web/hokaze/src/data/json/object").ObjectValue<{ a: number; b: number; c: number }, never> } }, p0: { request: { method: string; path: string; response: import("/home/louis/Web/hokaze/src/data/json/object").ObjectValue<{ a: number; b: number; c: number }, never> } }, c: 3, d: 4 })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.getJson).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/baz?x=a&y=7'))
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
    })*/
  })
})

describe('creating a GET request', () => {
  describe('inside a web service', () => {})
  test('without URL parameters', async () => {
    const http = fakeHttpClient()
    const ws = createWebService(
      { baseUrl: 'https://some-api.com/', http },
      {
        request: {
          method: 'GET',
          path: '/foo/bar',
          response: abcObject,
        },
      },
    )

    http.get.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await ws.request.send()

    expect(http.get).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      'application/json',
      new Headers(),
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  // NOT YET SUPPORTED
  /*test('with URL parameters', async () => {
    const req = ws.getRequest({
      path: '/foo/baz',
      request: xyObject,
      response: abcObject,
    })

    http.getJson.mockClear()
    http.getconfig: string | URL | WebServiceConfig, p0: { request: { method: string; path: string; response: import("/home/louis/Web/hokaze/src/data/json/object").ObjectValue<{ a: number; b: number; c: number }, never> } }, p0: { request: { method: string; path: string; response: import("/home/louis/Web/hokaze/src/data/json/object").ObjectValue<{ a: number; b: number; c: number }, never> } }, c: 3, d: 4 })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.getJson).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/baz?x=a&y=7'))
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
    })*/
})

describe('creating a POST request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://some-api.com/', http)

  test('without a request or response body', async () => {
    const req = ws.postRequest({ path: '/foo/bar' })

    http.post.mockResolvedValueOnce({
      responseBody: new Response(),
      location: null,
    })
    await req.send()

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new NoRequestBody(),
      '*/*',
      new Headers(),
    )
  })

  test('with a request and no response body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', request: xyObject })

    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: new Response(),
      location: null,
    })
    await req.send({ x: 'a', y: 7 })

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new JsonRequestBody({ x: 'a', y: 7 }),
      '*/*',
      new Headers(),
    )
  })

  test('with a response and no request body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', response: abcObject })

    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: Response.json({ a: 1, b: 2, c: 3, d: 4 }),
      location: null,
    })
    const res = await req.send()

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new NoRequestBody(),
      'application/json',
      new Headers(),
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  test('with both a request and response body', async () => {
    const req = ws.postRequest({
      path: '/foo/bar',
      request: xyObject,
      response: abcObject,
    })

    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: Response.json({ a: 1, b: 2, c: 3, d: 4 }),
      location: null,
    })
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new JsonRequestBody({ x: 'a', y: 7 }),
      'application/json',
      new Headers(),
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('creating a PUT request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://some-api.com/', http)

  test('without a request or response body', async () => {
    const req = ws.putRequest({ path: '/foo/bar' })

    http.put.mockResolvedValueOnce(new Response())
    await req.send()

    expect(http.put).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new NoRequestBody(),
      '*/*',
      new Headers(),
    )
  })

  test('with a request and no response body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', request: xyObject })

    http.put.mockClear()
    http.put.mockResolvedValueOnce(new Response())
    await req.send({ x: 'a', y: 7 })

    expect(http.put).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new JsonRequestBody({ x: 'a', y: 7 }),
      '*/*',
      new Headers(),
    )
  })

  test('with a response and no request body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', response: abcObject })

    http.put.mockClear()
    http.put.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await req.send()

    expect(http.put).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new NoRequestBody(),
      'application/json',
      new Headers(),
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  test('with both a request and response body', async () => {
    const req = ws.putRequest({
      path: '/foo/bar',
      request: xyObject,
      response: abcObject,
    })

    http.put.mockClear()
    http.put.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await req.send({ x: 'a', y: 7 })

    expect(http.put).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      new JsonRequestBody({ x: 'a', y: 7 }),
      'application/json',
      new Headers(),
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('creating a DELETE request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://some-api.com/', http)

  test('without a response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar' })

    http.delete.mockResolvedValueOnce(new Response())
    await req.send()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), '*/*', new Headers())
  })

  test('with a response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar', response: abcObject })

    http.delete.mockClear()
    http.delete.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await req.send()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/foo/bar'),
      'application/json',
      new Headers(),
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})
