import { Result } from '@module/result'
import { MappedField } from './base'

export class AutoMappedField extends MappedField {
  constructor(fieldName: string) {
    super(fieldName, fieldName)
  }

  public packValue(value: any): Result<any> {
    return Result.ok(value)
  }

  public unpackValue(value: any): Result<any> {
    return Result.ok(value)
  }
}
