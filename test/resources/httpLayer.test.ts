import { ResourceHttpLayer } from '@module/resources/sendAndReceive'
import { fakeHttpClient, fakeManager, fakeResource, Fruit } from '@fake'
import { UrlTemplate } from '@module/url'
import { Mapper } from '@module/resources/mappers'
import { HttpClient } from '@module/backend'
import { jest } from '@jest/globals'
import { Result } from '@module/result'
import assert from 'node:assert'
import { Manager } from '@module/resources/managers'

function makeHttpLayer(
  manager: Manager<Fruit>,
  client: HttpClient,
  mapper?: Mapper<any, Fruit>,
): ResourceHttpLayer<Fruit> {
  return new ResourceHttpLayer(
    manager,
    client,
    new UrlTemplate('https://my-api.com/v1', {}),
    'fruits',
    mapper ?? new Mapper({ name: 'fruits', fields: ['id', 'name'] }),
  )
}

function makeMapperThatHatesGrapes() {
  const mapper = new Mapper<any, Fruit>({ name: 'fruits', fields: ['id', 'name'] })
  const originalPackItem = mapper.packItem.bind(mapper)
  const mockPackItem = jest.spyOn(mapper, 'packItem').mockImplementation((item) => {
    if (item.name === 'Grape') {
      return Result.error('no grapes :(')
    } else {
      return originalPackItem(item)
    }
  })
  return mapper
}

describe('the get method', () => {
  test('makes a GET request to the url of the item', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    client.getJson.mockResolvedValueOnce({ id: 1, name: 'Apple' })

    await expect(http.get(1, { option: true })).resolves.toEqual({ id: 1, name: 'Apple' })

    expect(client.getJson).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits/1?option=true'))
  })
})

describe('the getAll method', () => {
  test('makes a GET request to the url of the resource', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    const fruitsJson = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Pear' },
      { id: 3, name: 'Apricot' },
      { id: 4, name: 'Plum' },
    ]

    client.getJson.mockResolvedValueOnce(fruitsJson)

    await expect(http.getAll({ option: true })).resolves.toEqual(fruitsJson)

    expect(client.getJson).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits?option=true'))
  })
})

describe('the send method', () => {
  test('makes a POST request to the url of the resource', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    client.postJson.mockResolvedValueOnce({ location: '', responseBody: undefined })

    await expect(http.send({ id: 5, name: 'Cherry' }, { option: true })).resolves.toBeUndefined()

    expect(client.postJson).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits?option=true'), {
      id: 5,
      name: 'Cherry',
    })
  })

  test('tries to extract the ID of the newly created item', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)
    const fruit: Fruit = { id: -1, name: 'Cherry' }

    // should not be able to guess the ID because there's no info in the response

    client.postJson.mockResolvedValueOnce({ location: '', responseBody: undefined })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual(-1)

    // should guess the ID from the body rather than the location header

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/6',
      responseBody: { id: 5, name: 'Cherry' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual(5)

    fruit.id = -1

    // should guess the ID if the body is directly a string or a number

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/6',
      responseBody: 5,
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual(5)

    fruit.id = -1

    // if only the location header is usable, it should fall back to it

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/6',
      responseBody: { not: 'useful' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual(6)

    fruit.id = -1
  })

  test('when using string IDs, integer values in the location header stay strings', async () => {
    const manager = fakeManager()
    jest.replaceProperty(manager, 'keyTypeHint', 'string')
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)
    const fruit: Fruit = { id: -1, name: 'Cherry' }

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/cherry',
      responseBody: { not: 'useful' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual('cherry')

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/5',
      responseBody: { not: 'useful' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual('5')
  })

  test('the first successful method of extracting the ID becomes the default', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)
    const fruit: Fruit = { id: -1, name: 'Cherry' }

    // if the first request find the id in the resource in the location header, it becomes the preferred method

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/6',
      responseBody: { not: 'useful' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()

    fruit.id = -1

    // now the location header is used rather than the body

    client.postJson.mockResolvedValueOnce({
      location: 'https://my-api.com/v1/fruits/6',
      responseBody: { id: 5, name: 'Cherry' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual(6)

    fruit.id = -1

    // if the location is unusable, it falls back to parsing the body

    client.postJson.mockResolvedValueOnce({
      location: '',
      responseBody: { id: 5, name: 'Cherry' },
    })
    await expect(http.send(fruit)).resolves.toBeUndefined()
    expect(fruit.id).toEqual(5)
  })
})

describe('the sendMany method', () => {
  test('makes a POST request for each item', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    client.postJson.mockResolvedValue({ location: '', responseBody: undefined })

    const newFruits: Fruit[] = [
      { id: -1, name: 'Cherry' },
      { id: -1, name: 'Grape' },
      { id: -1, name: 'Banana' },
    ]
    await expect(http.sendMany(newFruits, { option: true })).resolves.toBeUndefined()

    expect(client.postJson).toHaveBeenCalledTimes(3)
    newFruits.forEach((fruit) =>
      expect(client.postJson).toHaveBeenCalledWith(new URL('https://my-api.com/v1/fruits?option=true'), fruit),
    )
  })

  test('continues even if an item is invalid or if a request fails', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const mapper = makeMapperThatHatesGrapes()
    const http = makeHttpLayer(manager, client, mapper)

    client.postJson.mockRejectedValueOnce('server not ready yet !').mockResolvedValue({ location: '', responseBody: 6 })

    const newFruits: Fruit[] = [
      { id: -1, name: 'Cherry' },
      { id: -1, name: 'Grape' },
      { id: -1, name: 'Banana' },
    ]
    await expect(http.sendMany(newFruits, { option: true })).rejects.toThrow()
    expect(newFruits[0].id).toEqual(-1) // the HTTP client failed
    expect(newFruits[1].id).toEqual(-1) // the mapper failed
    expect(newFruits[2].id).toEqual(6) // still Banana was sent correctly

    expect(client.postJson).toHaveBeenCalledTimes(2)

    newFruits
      .filter((fruit) => fruit.name !== 'Grape') // since packing this failed, the request was not sent
      .forEach((fruit, i) =>
        expect(client.postJson).toHaveBeenNthCalledWith(i + 1, new URL('https://my-api.com/v1/fruits?option=true'), {
          ...fruit,
          id: -1, // all IDs were -1 at the time
        }),
      )
  })
})

describe('the save method', () => {
  test('makes a POST request if the object was never saved', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    const newFruit: Fruit = { id: -1, name: 'Cherry' }
    assert(manager.isNew(newFruit))

    client.postJson.mockResolvedValueOnce({ location: '', responseBody: undefined })
    await expect(http.save(newFruit, { option: true })).resolves.toBeUndefined()

    expect(client.postJson).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits?option=true'), {
      id: -1,
      name: 'Cherry',
    })
  })

  test('makes a PUT request if the object already exists in the resource', async () => {
    const resource = fakeResource()
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    const existingFruit: Fruit = await resource.get(2)
    assert(!manager.isNew(existingFruit))

    await expect(http.save(existingFruit, { option: true })).resolves.toBeUndefined()

    expect(client.putJson).toHaveBeenCalledExactlyOnceWith(
      new URL('https://my-api.com/v1/fruits/2?option=true'),
      existingFruit,
    )
  })
})

describe('the saveMany method', () => {
  test('makes a request for each item', async () => {
    const resource = fakeResource()
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    client.postJson.mockResolvedValue({ location: '', responseBody: undefined })

    const fruits: Fruit[] = [{ id: -1, name: 'Cherry' }, await resource.get(2), { id: -1, name: 'Banana' }]
    assert(manager.isNew(fruits[0]))
    assert(!manager.isNew(fruits[1]))
    assert(manager.isNew(fruits[2]))

    await expect(http.saveMany(fruits, { option: true })).resolves.toBeUndefined()

    expect(client.postJson).toHaveBeenCalledTimes(2)
    expect(client.putJson).toHaveBeenCalledTimes(1)

    expect(client.postJson).toHaveBeenCalledWith(new URL('https://my-api.com/v1/fruits?option=true'), fruits[0])
    expect(client.putJson).toHaveBeenCalledWith(new URL('https://my-api.com/v1/fruits/2?option=true'), fruits[1])
    expect(client.postJson).toHaveBeenCalledWith(new URL('https://my-api.com/v1/fruits?option=true'), fruits[2])
  })

  test('continues even if an item is invalid or if a request fails', async () => {
    const resource = fakeResource()
    const manager = fakeManager()
    const client = fakeHttpClient()
    const mapper = makeMapperThatHatesGrapes()
    const http = makeHttpLayer(manager, client, mapper)

    client.putJson.mockRejectedValueOnce('server not ready yet !')
    client.postJson.mockResolvedValue({ location: '', responseBody: 6 })

    const fruits: Fruit[] = [await resource.get(2), { id: -1, name: 'Grape' }, { id: -1, name: 'Banana' }]
    assert(!manager.isNew(fruits[0]))
    assert(manager.isNew(fruits[1]))
    assert(manager.isNew(fruits[2]))

    await expect(http.saveMany(fruits, { option: true })).rejects.toThrow()
    expect(fruits[0].id).toEqual(2) // the HTTP client failed, but the item already has an id
    expect(fruits[1].id).toEqual(-1) // the mapper failed
    expect(fruits[2].id).toEqual(6) // Banana was still sent correctly

    expect(client.putJson).toHaveBeenCalledTimes(1)
    expect(client.postJson).toHaveBeenCalledTimes(1)

    expect(client.putJson).toHaveBeenCalledWith(new URL('https://my-api.com/v1/fruits/2?option=true'), fruits[0])
    expect(client.postJson).toHaveBeenCalledWith(new URL('https://my-api.com/v1/fruits?option=true'), {
      id: -1,
      name: 'Banana',
    })
  })
})

describe('the delete method', () => {
  test('makes a DELETE request to the url of the item', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    await expect(http.delete({ id: 5, name: 'Cherry' }, { option: true })).resolves.toBeUndefined()

    expect(client.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits/5?option=true'))
  })
})

describe('the deleteKey method', () => {
  test('makes a DELETE request to the url of the item using the given key', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    await expect(http.deleteKey(5, { option: true })).resolves.toBeUndefined()

    expect(client.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits/5?option=true'))
  })
})

describe('the deleteMany method', () => {
  test('makes a request for each item', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    const fruits: Fruit[] = [
      { id: 5, name: 'Cherry' },
      { id: 6, name: 'Grape' },
      { id: 7, name: 'Banana' },
    ]

    await expect(http.deleteMany(fruits, { option: true })).resolves.toBeUndefined()

    expect(client.delete).toHaveBeenCalledTimes(3)
    fruits.forEach((fruit) =>
      expect(client.delete).toHaveBeenCalledWith(new URL(`https://my-api.com/v1/fruits/${fruit.id}?option=true`)),
    )
  })

  test('continues even if a request fails', async () => {
    const resource = fakeResource()
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    client.delete.mockRejectedValueOnce('server not ready yet !')

    const fruits: Fruit[] = [
      { id: 5, name: 'Cherry' },
      { id: 6, name: 'Grape' },
      { id: 7, name: 'Banana' },
    ]

    await expect(http.deleteMany(fruits, { option: true })).rejects.toThrow()
    expect(client.delete).toHaveBeenCalledTimes(3)
  })
})

describe('the deleteAll method', () => {
  test('makes a DELETE request to the url of the resource', async () => {
    const manager = fakeManager()
    const client = fakeHttpClient()
    const http = makeHttpLayer(manager, client)

    await expect(http.deleteAll({ option: true })).resolves.toBeUndefined()

    expect(client.delete).toHaveBeenCalledExactlyOnceWith(new URL('https://my-api.com/v1/fruits?option=true'))
  })
})
