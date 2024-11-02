import type { CreationResult } from '@module/backend'
import type { Key } from '@module/resources'
import { ObjectMapper } from '@module/mappers/serialized/object'
import { KeyKind } from '@module/data/serialized'

export interface KeyExtractionMethod {
  tryToExtractKey(postResult: CreationResult): Promise<Key | undefined>
}

export class ExtractFromObjectBody implements KeyExtractionMethod {
  private readonly _mapper: ObjectMapper<unknown>

  public constructor(mapper: ObjectMapper<unknown>) {
    this._mapper = mapper
  }

  public tryToExtractKey(postResult: CreationResult): Promise<Key | undefined> {
    let keyFound = undefined

    if (typeof postResult.responseBody === 'object') {
      keyFound = this._mapper.tryToUnpackKey(postResult.responseBody)
    }

    return Promise.resolve(keyFound)
  }
}

export class ExtractFromKeyBody implements KeyExtractionMethod {
  public async tryToExtractKey(postResult: CreationResult): Promise<Key | undefined> {
    let keyFound = undefined

    try {
      const response = await postResult.responseBody.json()

      if (typeof response === 'string' || typeof response === 'number') {
        keyFound = response
      }
    } catch {
      /* no key found */
    }

    return keyFound
  }
}

export class ExtractFromLocationUrl implements KeyExtractionMethod {
  private readonly _plainResourceUrl: URL
  private readonly _keyKind: KeyKind

  public constructor(plainResourceUrl: URL, keyKind: KeyKind) {
    this._plainResourceUrl = plainResourceUrl
    this._keyKind = keyKind
  }

  public tryToExtractKey(postResult: CreationResult): Promise<Key | undefined> {
    let keyFound = undefined

    if (postResult.location !== null) {
      try {
        const locationPath = new URL(postResult.location).pathname
        const resourcePath = this._plainResourceUrl.pathname + '/'

        if (locationPath.startsWith(resourcePath)) {
          const stringKey = locationPath.substring(resourcePath.length)
          const intKey = parseInt(stringKey)

          if (!isNaN(intKey) && this._keyKind === 'integer') {
            keyFound = intKey
          } else {
            keyFound = stringKey
          }
        }
      } catch {
        /* ignore TypeErrors when creating the location URL */
      }
    }

    return Promise.resolve(keyFound)
  }
}
