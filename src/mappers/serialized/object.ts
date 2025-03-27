import { type EagerReferenceLoader, ValueMapper } from '@module/mappers/serialized'
import { Key } from '@module/resources'

export interface ObjectMapper<T> extends ValueMapper<T> {
  setKeyProperty(value: string): void

  tryToUnpackKey(responseBody: string): Key | undefined

  tryToUnpackRef(responseValue: unknown, refLoader: EagerReferenceLoader): RefDataResult<T>
}

export type RefDataResult<T> = { found: 'value'; value: T } | { found: 'key'; key: unknown } | { found: 'nothing' }
