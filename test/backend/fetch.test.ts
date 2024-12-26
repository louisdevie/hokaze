import { FetchHttpClient } from '@module/backend/fetch'
import { JsonRequestBody } from '@module/mappers/serialized/json/jsonRequestBody'
import { NoRequestBody } from '@module/mappers/noRequestBody'
import { defaultConfig } from '@module/config/default'

const fetchMock = jest.spyOn(global, 'fetch')

beforeEach(() => fetchMock.mockClear())

const testData = {
  firstName: 'Kikyō',
  lastName: 'Yoshikawa',
  age: 27,
  occupation: 'Researcher (Formerly)',
}

test('get makes a GET request', async () => {
  const client = new FetchHttpClient(defaultConfig)

  fetchMock.mockResolvedValueOnce(
    Response.json(testData, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  const result = await client.get(new URL('https://toaruapi.com/characters/53'), 'application/json')

  expect(await result.json()).toEqual(testData)
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
    method: 'GET',
    headers: new Headers({
      Accept: 'application/json',
    }),
  })
})

describe('post', () => {
  test('makes a POST request and returns the response and the location header', async () => {
    const client = new FetchHttpClient(defaultConfig)

    // no Location header in the response

    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }))

    let result = await client.post(new URL('https://toaruapi.com/characters'), new JsonRequestBody(testData), '*/*')

    expect(await result.responseBody.text()).toEqual('not json')
    expect(result.location).toBeNull()
    expect(fetchMock).toHaveBeenLastCalledWith(new URL('https://toaruapi.com/characters'), {
      method: 'POST',
      body: JSON.stringify(testData),
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: '*/*',
      }),
    })

    // Location header in the response

    fetchMock.mockResolvedValueOnce(
      new Response('', {
        status: 200,
        headers: { Location: 'https://toaruapi.com/characters/53' },
      }),
    )

    result = await client.post(new URL('https://toaruapi.com/characters'), new JsonRequestBody(testData), '*/*')

    expect(result.location).toEqual('https://toaruapi.com/characters/53')
  })

  test("doesn't include a Content-Type header if there's no body", async () => {
    const client = new FetchHttpClient(defaultConfig)

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    await client.post(new URL('https://toaruapi.com/characters'), new NoRequestBody(), '*/*')

    expect(fetchMock).toHaveBeenLastCalledWith(new URL('https://toaruapi.com/characters'), {
      method: 'POST',
      body: null,
      headers: new Headers({
        Accept: '*/*',
      }),
    })
  })
})

describe('put', () => {
  test('makes a PUT request', async () => {
    const client = new FetchHttpClient(defaultConfig)

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    await client.put(new URL('https://toaruapi.com/characters/53'), new JsonRequestBody(testData), '*/*')

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
      method: 'PUT',
      body: JSON.stringify(testData),
      headers: new Headers({
        Accept: '*/*',
        'Content-Type': 'application/json',
      }),
    })
  })

  test("doesn't include a Content-Type header if there's no body", async () => {
    const client = new FetchHttpClient(defaultConfig)

    fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

    await client.put(new URL('https://toaruapi.com/characters/53'), new NoRequestBody(), '*/*')

    expect(fetchMock).toHaveBeenLastCalledWith(new URL('https://toaruapi.com/characters/53'), {
      method: 'PUT',
      body: null,
      headers: new Headers({
        Accept: '*/*',
      }),
    })
  })
})

test('delete makes a DELETE request', async () => {
  const client = new FetchHttpClient(defaultConfig)

  fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

  await client.delete(new URL('https://toaruapi.com/characters/53'), '*/*')

  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
    method: 'DELETE',
    headers: new Headers({
      Accept: '*/*',
    }),
  })
})

test('a status code outside the range 200-299 results in an error', async () => {
  const client = new FetchHttpClient(defaultConfig)

  fetchMock.mockResolvedValueOnce(
    Response.json(testData, {
      status: 416,
      headers: { 'Content-Type': 'application/json' },
    }),
  )

  await expect(() =>
    client.get(new URL('https://toaruapi.com/characters/53'), 'application/json'),
  ).rejects.toMatchObject({ status: 416 })
})
