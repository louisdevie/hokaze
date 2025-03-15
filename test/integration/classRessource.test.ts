import { fakeHttpClient, fakeService } from '@fake'
import { number, object, string } from '@module'
import { JsonRequestBody } from '@module/mappers/serialized/json/jsonRequestBody'

class Weapon {
  public id!: number
  public type!: string
  public variant!: string
  public baseDamage!: number

  public constructor(init?: Partial<Weapon>) {
    if (init) Object.assign(this, init)
  }
}

describe('creating a collection resource from a service', () => {
  const http = fakeHttpClient()
  const ws = fakeService('https://ultrapi.dev/', http)
  const collection = ws.collection(
    'weapons',
    object({
      id: number.withBlankValue(-1),
      type: string,
      variant: string,
      baseDamage: number,
    }).asInstanceOf(Weapon),
  )

  test('to read a value', async () => {
    const data = { id: 1, type: 'revolver', variant: 'piercer', baseDamage: 1 }
    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(data))
    const res = await collection.get(1)

    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://ultrapi.dev/weapons/1'), 'application/json')
    expect(res).toStrictEqual(new Weapon(data))
  })

  test('to read all values', async () => {
    const data = [
      { id: 1, type: 'revolver', variant: 'piercer', baseDamage: 1 },
      { id: 2, type: 'shotgun', variant: 'core eject', baseDamage: 3 },
      { id: 14, type: 'rocket launcher', variant: 's.r.s cannon', baseDamage: 3.5 },
    ]
    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(data))
    const res = await collection.getAll()

    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://ultrapi.dev/weapons'), 'application/json')
    expect(res).toStrictEqual(data.map((w) => new Weapon(w)))
  })

  test('to create a new value to send', () => {
    expect(collection.create()).toMatchObject({ id: -1, type: '', variant: '', baseDamage: 0 })
  })

  test('to send a value', async () => {
    const data = new Weapon()
    data.id = -1
    data.type = 'rocket launcher'
    data.variant = 'firestarter'
    data.baseDamage = 3.5

    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: new Response(),
      location: null,
    })
    await collection.send(data)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://ultrapi.dev/weapons'),
      new JsonRequestBody(data),
      '*/*',
    )
  })

  test('to save a new value', async () => {
    const data = collection.create()
    data.type = 'shotgun'
    data.variant = 'pump charge'
    http.post.mockClear()
    http.post.mockResolvedValueOnce({
      responseBody: new Response(),
      location: null,
    })
    await collection.save(data)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://ultrapi.dev/weapons'),
      new JsonRequestBody(data),
      '*/*',
    )
  })

  describe('to save a new value and get its ID', () => {
    test('through the Location header', async () => {
      const data = collection.create()
      data.type = 'shotgun'
      data.variant = 'pump charge'
      http.post.mockClear()
      http.post.mockResolvedValueOnce({
        responseBody: new Response(),
        location: 'https://ultrapi.dev/weapons/4593',
      })
      await collection.save(data)

      expect(http.post).toHaveBeenCalledExactlyOnceWith(
        new URL('https://ultrapi.dev/weapons'),
        new JsonRequestBody({ baseDamage: 0, id: -1, type: 'shotgun', variant: 'pump charge' }),
        '*/*',
      )
      expect(data.id).toStrictEqual(4593)
    })
    test('through a response body containing the object', async () => {
      const data = collection.create()
      data.type = 'shotgun'
      data.variant = 'pump charge'
      http.post.mockClear()
      http.post.mockResolvedValueOnce({
        responseBody: new Response(
          JSON.stringify({ baseDamage: 0, id: 4593, type: 'shotgun', variant: 'pump charge' }),
        ),
        location: null,
      })
      await collection.save(data)

      expect(http.post).toHaveBeenCalledExactlyOnceWith(
        new URL('https://ultrapi.dev/weapons'),
        new JsonRequestBody({ baseDamage: 0, id: -1, type: 'shotgun', variant: 'pump charge' }),
        '*/*',
      )
      expect(data.id).toStrictEqual(4593)
    })
    test('through a response body containing the ID', async () => {
      const data = collection.create()
      data.type = 'shotgun'
      data.variant = 'pump charge'

      http.post.mockClear()
      http.post.mockResolvedValueOnce({
        responseBody: new Response('4593'),
        location: null,
      })
      await collection.save(data)

      expect(http.post).toHaveBeenCalledExactlyOnceWith(
        new URL('https://ultrapi.dev/weapons'),
        new JsonRequestBody({ baseDamage: 0, id: -1, type: 'shotgun', variant: 'pump charge' }),
        '*/*',
      )
      expect(data.id).toStrictEqual(4593)
    })
  })

  test('to save an existing value', async () => {
    const data = new Weapon()
    data.id = 4
    data.type = 'shotgun'
    data.variant = 'pump charge'
    data.baseDamage = 2.5

    http.put.mockClear()
    http.put.mockResolvedValueOnce(new Response())
    await collection.save(data)

    expect(http.put).toHaveBeenCalledExactlyOnceWith(
      new URL('https://ultrapi.dev/weapons/4'),
      new JsonRequestBody(data),
      '*/*',
    )
  })

  test('to delete a value', async () => {
    const data = new Weapon()
    data.id = 4

    http.delete.mockClear()
    http.delete.mockResolvedValueOnce(new Response())
    await collection.delete(data)

    expect(http.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://ultrapi.dev/weapons/4'), '*/*')
  })
})
