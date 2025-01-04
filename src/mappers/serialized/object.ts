import { ValueMapper } from '@module/mappers/serialized'
import { Key } from '@module/resources'

export interface ObjectMapper<T> extends ValueMapper<T> {
  setKeyProperty(value: string): void

  tryToUnpackKey(responseBody: string): Promise<Key | undefined>

  tryToUnpackRef(responseValue: unknown): RefDataResult<T>
}

export type RefDataResult<T> = { found: 'value'; value: T } | { found: 'key'; key: unknown } | { found: 'nothing' }
