import type { CreationResult } from '../../http'
import { KeyKind } from '@module/data/serialized'
import { ObjectMapper } from '@module/mappers/serialized/object'
import type { Key } from '@module/resources'

export interface ConsumedCreationResult {
  location: string | null
  responseBody: string
}

export interface KeyExtractionMethod {
  tryToExtractKey(postResult: ConsumedCreationResult): Key | undefined
}

export async function consumeCreationResult(result: CreationResult): Promise<ConsumedCreationResult> {
  try {
    const text = await result.responseBody.text()
    return { responseBody: text, location: result.location }
  } catch {
    return { responseBody: '', location: result.location }
  }
}

export class ExtractFromObjectBody implements KeyExtractionMethod {
  private readonly _mapper: ObjectMapper<unknown>

  public constructor(mapper: ObjectMapper<unknown>) {
    this._mapper = mapper
  }

  public tryToExtractKey(postResult: ConsumedCreationResult): Key | undefined {
    return this._mapper.tryToUnpackKey(postResult.responseBody)
  }
}

export class ExtractFromKeyBody implements KeyExtractionMethod {
  private readonly _keyKind: KeyKind

  public constructor(keyKind: KeyKind) {
    this._keyKind = keyKind
  }

  public tryToExtractKey(postResult: ConsumedCreationResult): Key | undefined {
    let keyFound: unknown = undefined

    try {
      keyFound = JSON.parse(postResult.responseBody)
      if (typeof keyFound !== 'number' && typeof keyFound !== 'string') {
        keyFound = undefined
      }
    } catch {
      keyFound = postResult.responseBody.trim()
      if ((keyFound as string).length === 0) {
        keyFound = undefined
      }
    }

    return keyFound as Key | undefined
  }
}

export class ExtractFromLocationUrl implements KeyExtractionMethod {
  private readonly _plainResourceUrl: URL
  private readonly _keyKind: KeyKind

  public constructor(plainResourceUrl: URL, keyKind: KeyKind) {
    this._plainResourceUrl = plainResourceUrl
    this._keyKind = keyKind
  }

  public tryToExtractKey(postResult: ConsumedCreationResult): Key | undefined {
    let keyFound = undefined

    if (postResult.location !== null) {
      try {
        const locationPath = new URL(postResult.location).pathname
        const resourcePath = this._plainResourceUrl.pathname + '/'

        if (locationPath.startsWith(resourcePath)) {
          const stringKey = locationPath.substring(resourcePath.length)
          if (this._keyKind === 'integer') {
            const intKey = parseInt(stringKey)
            if (isNaN(intKey)) {
              keyFound = stringKey
            } else {
              keyFound = intKey
            }
          }
        }
      } catch {
        /* ignore TypeErrors when creating the location URL */
      }
    }

    return keyFound
  }
}
