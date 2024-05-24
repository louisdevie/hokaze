import { Result } from '@module/result'
import { MappedField } from './base'

export class AutoMappedField extends MappedField {
  public constructor(fieldName: string) {
    super(fieldName, fieldName)
  }

  public packValue(value: unknown): Result<unknown> {
    return Result.ok(value)
  }

  public unpackValue(value: unknown): Result<unknown> {
    return Result.ok(value)
  }
}
