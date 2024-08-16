import { fakeHttpClient, fakeService } from '@fake'
import {number, object, string} from '@module'
import {NoRequestBody} from "@module/mappers/noRequestBody";
import {JsonRequestBody} from "@module/mappers/serialized/json/jsonRequestBody";

const abcObject = object({ a: number, b: number, c: number })
const xyObject = object({ x: string, y: number })

describe('creating a GET request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://some-api.com/', http)

  test('without arguments', async () => {
    const req = ws.getRequest({ path: '/foo/bar', response: abcObject })

    http.get.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await req.send()

    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), "application/json")
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })

  // NOT YET SUPPORTED
  /*test('with arguments', async () => {
    const req = ws.getRequest({
      path: '/foo/baz',
      request: xyObject,
      response: abcObject,
    })

    http.getJson.mockClear()
    http.getJson.mockResolvedValueOnce({ a: 1, b: 2, c: 3, d: 4 })
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

    expect(http.post).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new NoRequestBody(), "*/*")
  })

  test('with a request and no response body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', request: xyObject })

    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: new Response(),
      location: null,
    })
    await req.send({ x: 'a', y: 7 })

    expect(http.post).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new JsonRequestBody({ x: 'a', y: 7 }), "*/*")
  })

  test('with a response and no request body', async () => {
    const req = ws.postRequest({ path: '/foo/bar', response: abcObject })

    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: Response.json({ a: 1, b: 2, c: 3, d: 4 }),
      location: null,
    })
    const res = await req.send()

    expect(http.post).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new NoRequestBody(), "application/json")
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

    expect(http.post).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new JsonRequestBody({ x: 'a', y: 7 }), "application/json")
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

    expect(http.put).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new NoRequestBody(), "*/*")
  })

  test('with a request and no response body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', request: xyObject })

    http.put.mockClear()
    http.put.mockResolvedValueOnce(new Response())
    await req.send({ x: 'a', y: 7 })

    expect(http.put).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new JsonRequestBody({ x: 'a', y: 7 }), "*/*")
  })

  test('with a response and no request body', async () => {
    const req = ws.putRequest({ path: '/foo/bar', response: abcObject })

    http.put.mockClear()
    http.put.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await req.send()

    expect(http.put).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), new NoRequestBody(), "application/json")
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
      "application/json"
    )
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('creating a DELETE request from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://some-api.com/', http)

  test('without a response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar' })

    http.delete.mockResolvedValueOnce(new Response)
    await req.send()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), "*/*")
  })

  test('with a response body', async () => {
    const req = ws.deleteRequest({ path: '/foo/bar', response: abcObject })

    http.delete.mockClear()
    http.delete.mockResolvedValueOnce(Response.json({ a: 1, b: 2, c: 3, d: 4 }))
    const res = await req.send()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://some-api.com/foo/bar'), "application/json")
    expect(res).toStrictEqual({ a: 1, b: 2, c: 3 })
  })
})