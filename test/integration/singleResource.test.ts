import { fakeHttpClient, fakeService } from '@fake'
import { number, Service } from '@module'
import { JsonRequestBody } from '@module/mappers/json/json/jsonRequestBody'

describe('creating a single resource', () => {
  describe('by extending the SingleResource class', () => {
    const http = fakeHttpClient()
    const ws = fakeService('https://some-api.com/', http)
    class MyResource extends SingleResource<number> {
      public constructor(ws: Service) {
        super(ws, 'days-since-last-js-framework', number)
      }
    }

    test('to read the value', async () => {
      http.get.mockResolvedValueOnce(Response.json(6))
      const res = await single.get()

      expect(http.get).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        'application/json',
      )
      expect(res).toEqual(6)
    })

    test('to create a new value to send', () => {
      expect(single.create()).toEqual(0)
    })

    test('to send a value', async () => {
      http.post.mockResolvedValueOnce({
        responseBody: new Response(),
        location: null,
      })
      await single.send(7)

      expect(http.post).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        new JsonRequestBody(7),
        '*/*',
      )
    })

    test('to update the value', async () => {
      http.put.mockResolvedValueOnce(new Response())
      await single.save(7)

      expect(http.put).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        new JsonRequestBody(7),
        '*/*',
      )
    })

    test('to delete the value', async () => {
      http.delete.mockResolvedValueOnce(new Response())
      await single.delete()

      expect(http.delete).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        '*/*',
      )
    })
  })

  describe('using the singleResource function', () => {
    const http = fakeHttpClient()
    const ws = fakeService('https://some-api.com/', http)
    const single = ws.single('days-since-last-js-framework', number)

    test('to read the value', async () => {
      http.get.mockResolvedValueOnce(Response.json(6))
      const res = await single.get()

      expect(http.get).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        'application/json',
      )
      expect(res).toEqual(6)
    })

    test('to create a new value to send', () => {
      expect(single.create()).toEqual(0)
    })

    test('to send a value', async () => {
      http.post.mockResolvedValueOnce({
        responseBody: new Response(),
        location: null,
      })
      await single.send(7)

      expect(http.post).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        new JsonRequestBody(7),
        '*/*',
      )
    })

    test('to update the value', async () => {
      http.put.mockResolvedValueOnce(new Response())
      await single.save(7)

      expect(http.put).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        new JsonRequestBody(7),
        '*/*',
      )
    })

    test('to delete the value', async () => {
      http.delete.mockResolvedValueOnce(new Response())
      await single.delete()

      expect(http.delete).toHaveBeenCalledExactlyOnceWith(
        new URL('https://some-api.com/days-since-last-js-framework'),
        '*/*',
      )
    })
  })
})
