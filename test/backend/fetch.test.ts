import { FetchHttpClient } from '@module/backend/fetch'

const fetchMock = jest.spyOn(global, 'fetch')

beforeEach(() => fetchMock.mockClear())

const testData = {
  firstName: 'Kikyō',
  lastName: 'Yoshikawa',
  age: 27,
  occupation: 'Researcher (Formerly)',
}

test('getJson makes a GET request and parse the response as JSON', async () => {
  const client = new FetchHttpClient()

  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(testData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  const result = await client.getJson(new URL('https://toaruapi.com/characters/53'))

  expect(result).toEqual(testData)
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
})

describe('postJson', () => {
  test('makes a POST request with a JSON body and returns the response and the location header', async () => {
    const client = new FetchHttpClient()

    // no infos in the response

    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }))

    let result = await client.postJson(new URL('https://toaruapi.com/characters'), testData)

    expect(result).toStrictEqual({ responseBody: undefined, location: null })
    expect(fetchMock).toHaveBeenLastCalledWith(new URL('https://toaruapi.com/characters'), {
      method: 'POST',
      body: JSON.stringify(testData),
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    })

    // valid json in the response body

    fetchMock.mockResolvedValueOnce(new Response('4', { status: 200 }))

    result = await client.postJson(new URL('https://toaruapi.com/characters'), testData)

    expect(result).toStrictEqual({ responseBody: 4, location: null })

    // Location header in the response

    fetchMock.mockResolvedValueOnce(
      new Response('', { status: 200, headers: { Location: 'https://toaruapi.com/characters/53' } }),
    )

    result = await client.postJson(new URL('https://toaruapi.com/characters'), testData)

    expect(result).toStrictEqual({ responseBody: undefined, location: 'https://toaruapi.com/characters/53' })
  })

  test("doesn't include a Content-Type header if there's no body", async () => {
    const client = new FetchHttpClient()

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    const result = await client.postJson(new URL('https://toaruapi.com/characters'), undefined)

    expect(result).toStrictEqual({ responseBody: undefined, location: null })
    expect(fetchMock).toHaveBeenLastCalledWith(new URL('https://toaruapi.com/characters'), {
      method: 'POST',
      body: undefined,
      headers: {
        Accept: '*/*',
      },
    })
  })
})

describe('putJson', () => {
  test('makes a PUT request with a JSON body', async () => {
    const client = new FetchHttpClient()

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    await client.putJson(new URL('https://toaruapi.com/characters/53'), testData)

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
      method: 'PUT',
      body: JSON.stringify(testData),
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
  })

  test("doesn't parse the response unless explicitly told to do so", async () => {
    const client = new FetchHttpClient()

    fetchMock.mockResolvedValue(new Response(JSON.stringify(testData), { status: 200 }))

    let res = await client.putJson(new URL('https://toaruapi.com/characters/53'), testData)
    expect(res).toBeUndefined()

    res = await client.putJson(new URL('https://toaruapi.com/characters/53'), testData, true)
    expect(res).toBeUndefined()

    res = await client.putJson(new URL('https://toaruapi.com/characters/53'), testData, false)
    expect(res).toEqual(testData)

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    res = await client.putJson(new URL('https://toaruapi.com/characters/53'), testData, false)
    expect(res).toBeUndefined()
  })
})

describe('delete', () => {
  test('makes an empty DELETE request', async () => {
    const client = new FetchHttpClient()

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    await client.delete(new URL('https://toaruapi.com/characters/53'))

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
      },
    })
  })

  test("doesn't parse the response unless explicitly told to do so", async () => {
    const client = new FetchHttpClient()

    fetchMock.mockResolvedValue(new Response('{ "deleteCount": 1 }', { status: 200 }))

    let res = await client.delete(new URL('https://toaruapi.com/characters/53'))
    expect(res).toBeUndefined()

    res = await client.delete(new URL('https://toaruapi.com/characters/53'), true)
    expect(res).toBeUndefined()

    res = await client.delete(new URL('https://toaruapi.com/characters/53'), false)
    expect(res).toEqual({ deleteCount: 1 })

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    res = await client.delete(new URL('https://toaruapi.com/characters/53'), false)
    expect(res).toBeUndefined()
  })
})
