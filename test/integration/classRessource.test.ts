import { fakeHttpClient, fakeService } from '@fake'
import { number, object } from '@module'
import { JsonRequestBody } from '@module/mappers/serialized/json/jsonRequestBody'

class TimeSpan {
  private readonly _totalMinutes: number

  public constructor(init?: number | { minutes?: number; hours?: number; days?: number }) {
    if (init === undefined) {
      this._totalMinutes = 0
    } else if (typeof init === 'number') {
      this._totalMinutes = init
    } else {
      this._totalMinutes = (init.minutes ?? 0) + (init.hours ?? 0) * 60 + (init.days ?? 0) * 1440
    }
  }

  public get minutes(): number {
    return this._totalMinutes % 60
  }

  public get hours(): number {
    return Math.floor(this._totalMinutes / 60) % 24
  }

  public get days(): number {
    return Math.floor(this._totalMinutes / 1440)
  }
}

describe('creating a single resource that is mapped to a class', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://some-api.com/', http)
  const single = ws.single(
    'time-since-last-js-framework',
    object({ minutes: number.optional, hours: number.optional, days: number.optional }).asInstanceOf(TimeSpan),
  )

  test('to read the value', async () => {
    http.get.mockResolvedValueOnce(Response.json({ hours: 5 }))
    const res = await single.get()

    expect(http.get).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/time-since-last-js-framework'),
      'application/json',
    )
    expect(res).toEqual(new TimeSpan(300))
  })

  test('to create a new value to send', () => {
    expect(single.create()).toEqual(new TimeSpan(0))
  })

  test('to send a value', async () => {
    http.post.mockResolvedValueOnce({
      responseBody: new Response(),
      location: null,
    })
    await single.send(new TimeSpan({ minutes: 200 }))

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/time-since-last-js-framework'),
      new JsonRequestBody({ minutes: 20, hours: 3, days: 0 }),
      '*/*',
    )
  })

  test('to update the value', async () => {
    http.put.mockResolvedValueOnce(new Response())
    await single.save(new TimeSpan({ hours: 1.5 }))

    expect(http.put).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/time-since-last-js-framework'),
      new JsonRequestBody({ minutes: 30, hours: 1, days: 0 }),
      '*/*',
    )
  })

  test('to delete the value', async () => {
    http.delete.mockResolvedValueOnce(new Response())
    await single.delete()

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(
      new URL('https://some-api.com/time-since-last-js-framework'),
      '*/*',
    )
  })
})
