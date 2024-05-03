import { FetchHttpClient } from '@module/backend/fetch'

let fetchMock = jest.spyOn(global, 'fetch')

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

test('postJson makes a POST request with a JSON body and returns the response and the location header', async () => {
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

test('putJson makes a PUT request with a JSON body', async () => {
  const client = new FetchHttpClient()

  fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

  await client.putJson(new URL('https://toaruapi.com/characters/53'), testData)

  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), {
    method: 'PUT',
    body: JSON.stringify(testData),
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

test('delete makes an empty DELETE request', async () => {
  const client = new FetchHttpClient()

  fetchMock.mockResolvedValueOnce(new Response('', { status: 200 }))

  await client.delete(new URL('https://toaruapi.com/characters/53'))

  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(new URL('https://toaruapi.com/characters/53'), { method: 'DELETE' })
})
