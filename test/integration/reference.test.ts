import { fakeHttpClient, fakeService } from '@fake'
import { number, object, string, ref, Ref } from '@module'
import { JsonRequestBody } from '@module/mappers/json/json/jsonRequestBody'

const http = fakeHttpClient()
const ws = fakeService('https://musicbrainz.org/ws', http)

const artists = ws.collection('artists', object({ id: number, name: string }))
const albumsWithArtistId = ws.collection(
  'albums',
  object({ id: number, title: string, year: number, artist: ref(artists) }),
)
const albumsWithArtistIdInObject = ws.collection(
  'albums',
  object({ id: number, title: string, year: number, artist: ref(artists).inObject }),
)
const albumsWithArtistObject = ws.collection(
  'albums',
  object({ id: number, title: string, year: number, artist: ref(artists).asObject }),
)
const albumsWithEagerLoading = ws.collection(
  'albums',
  object({ id: number, title: string, year: number, artist: ref(artists).eager }),
)

describe('read a resource with a reference', () => {
  const expectedUnloadedResult = {
    id: 1,
    title: 'VERTICAL HORIZON',
    year: 2013,
    artist: { key: 2, value: undefined },
  }
  const expectedLoadedResult = {
    id: 1,
    title: 'VERTICAL HORIZON',
    year: 2013,
    artist: { key: 2, value: { id: 2, name: 'Maon Kurosaki' } },
  }

  test('from the id', async () => {
    const albumData = { id: 1, title: 'VERTICAL HORIZON', year: 2013, artist: 2 }
    const artistData = { id: 2, name: 'Maon Kurosaki' }

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData))
    const res1 = await albumsWithArtistId.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res1).toMatchObject(expectedUnloadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData))
    const res2 = await albumsWithArtistIdInObject.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res2).toMatchObject(expectedUnloadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData))
    const res3 = await albumsWithArtistObject.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res3).toMatchObject(expectedUnloadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData)).mockResolvedValueOnce(Response.json(artistData))
    const res4 = await albumsWithEagerLoading.get(1)
    expect(http.get).toHaveBeenNthCalledWith(1, new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(http.get).toHaveBeenNthCalledWith(2, new URL('https://musicbrainz.org/ws/artists/2'), 'application/json')
    expect(res4).toMatchObject(expectedLoadedResult)
  })

  test('from an object containing the id', async () => {
    const albumData = { id: 1, title: 'VERTICAL HORIZON', year: 2013, artist: { id: 2 } }
    const artistData = { id: 2, name: 'Maon Kurosaki' }

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData))
    const res1 = await albumsWithArtistId.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res1).toMatchObject(expectedUnloadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData))
    const res2 = await albumsWithArtistIdInObject.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res2).toMatchObject(expectedUnloadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData))
    const res3 = await albumsWithArtistObject.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res3).toMatchObject(expectedUnloadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(albumData)).mockResolvedValueOnce(Response.json(artistData))
    const res4 = await albumsWithEagerLoading.get(1)
    expect(http.get).toHaveBeenNthCalledWith(1, new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(http.get).toHaveBeenNthCalledWith(2, new URL('https://musicbrainz.org/ws/artists/2'), 'application/json')
    expect(res4).toMatchObject(expectedLoadedResult)
  })

  test('from an object', async () => {
    const data = { id: 1, title: 'VERTICAL HORIZON', year: 2013, artist: { id: 2, name: 'Maon Kurosaki' } }

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(data))
    const res1 = await albumsWithArtistId.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res1).toMatchObject(expectedLoadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(data))
    const res2 = await albumsWithArtistIdInObject.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res2).toMatchObject(expectedLoadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(data))
    const res3 = await albumsWithArtistObject.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res3).toMatchObject(expectedLoadedResult)

    http.get.mockClear()
    http.get.mockResolvedValueOnce(Response.json(data))
    const res4 = await albumsWithEagerLoading.get(1)
    expect(http.get).toHaveBeenCalledExactlyOnceWith(new URL('https://musicbrainz.org/ws/albums/1'), 'application/json')
    expect(res4).toMatchObject(expectedLoadedResult)
  })
})

describe('write a resource with a reference', () => {
  const dataWithUnloadedRef = {
    id: 0,
    title: 'Beloved One',
    year: 2019,
    artist: Ref.fromKey(artists.asReferencable, 2),
  }
  const dataWithLoadedRef = {
    id: 0,
    title: 'Beloved One',
    year: 2019,
    artist: Ref.fromValue(artists.asReferencable, { id: 2, name: 'Maon Kurosaki' }),
  }

  test('as an id', async () => {
    const expectedPayload = { id: 0, title: 'Beloved One', year: 2019, artist: 2 }

    http.post.mockClear()
    http.post.mockResolvedValueOnce({ responseBody: new Response(), location: null })
    await albumsWithArtistId.send(dataWithUnloadedRef)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://musicbrainz.org/ws/albums'),
      new JsonRequestBody(expectedPayload),
      '*/*',
    )

    http.post.mockClear()
    http.post.mockResolvedValueOnce({ responseBody: new Response(), location: null })
    await albumsWithArtistId.send(dataWithLoadedRef)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://musicbrainz.org/ws/albums'),
      new JsonRequestBody(expectedPayload),
      '*/*',
    )
  })

  test('as an object containing id', async () => {
    const expectedPayload = { id: 0, title: 'Beloved One', year: 2019, artist: { id: 2 } }

    http.post.mockClear()
    http.post.mockResolvedValueOnce({ responseBody: new Response(), location: null })
    await albumsWithArtistIdInObject.send(dataWithUnloadedRef)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://musicbrainz.org/ws/albums'),
      new JsonRequestBody(expectedPayload),
      '*/*',
    )

    http.post.mockClear()
    http.post.mockResolvedValueOnce({ responseBody: new Response(), location: null })
    await albumsWithArtistIdInObject.send(dataWithLoadedRef)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://musicbrainz.org/ws/albums'),
      new JsonRequestBody(expectedPayload),
      '*/*',
    )
  })

  test('as an object', async () => {
    const expectedPayload = { id: 0, title: 'Beloved One', year: 2019, artist: { id: 2, name: 'Maon Kurosaki' } }

    http.post.mockClear()
    http.post.mockResolvedValueOnce({ responseBody: new Response(), location: null })
    await expect(albumsWithArtistObject.send(dataWithUnloadedRef)).toReject()

    http.post.mockClear()
    http.post.mockResolvedValueOnce({ responseBody: new Response(), location: null })
    await albumsWithArtistObject.send(dataWithLoadedRef)

    expect(http.post).toHaveBeenCalledExactlyOnceWith(
      new URL('https://musicbrainz.org/ws/albums'),
      new JsonRequestBody(expectedPayload),
      '*/*',
    )
  })
})
