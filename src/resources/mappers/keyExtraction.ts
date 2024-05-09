import type { CreationResult } from '@module/backend'
import type { Key } from '@module/resources'
import type { Mapper } from '@module/resources/mappers/index'
import type { KeyKind } from '@module/fields'

export interface KeyExtractionMethod {
  tryToExtractKey(postResult: CreationResult): Key | undefined
}

export class ExtractFromObjectBody implements KeyExtractionMethod {
  private readonly _mapper: Mapper<any, any>
  private readonly _key: string

  public constructor(mapper: Mapper<any, any>, key: string) {
    this._mapper = mapper
    this._key = key
  }

  public tryToExtractKey(postResult: CreationResult): Key | undefined {
    let keyFound = undefined

    if (typeof postResult.responseBody === 'object') {
      keyFound = this._mapper.tryToUnpackKey(postResult.responseBody, this._key).value
    }

    return keyFound
  }
}

export class ExtractFromKeyBody implements KeyExtractionMethod {
  public tryToExtractKey(postResult: CreationResult): Key | undefined {
    let keyFound = undefined

    if (typeof postResult.responseBody === 'string' || typeof postResult.responseBody === 'number') {
      keyFound = postResult.responseBody
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

  public tryToExtractKey(postResult: CreationResult): Key | undefined {
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

    return keyFound
  }
}
