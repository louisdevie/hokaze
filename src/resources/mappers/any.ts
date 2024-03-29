import { Field } from '@module/fields'
import { Result } from '@module/result'
import { MappedField } from './base'

export class AnyMappedField<T> extends MappedField {
  private readonly _descriptor: Field<T>

  public constructor(name: string, descriptor: Field<T>) {
    super(name, name)

    this._descriptor = descriptor
  }

  protected get descriptor(): Field<T> {
    return this._descriptor
  }

  public packValue(value: any): Result<any> {
    let result

    if (!this.descriptor.isWritable) {
      result = Result.ok(undefined)
    } else {
      result = Result.withValidation(value, this.descriptor.validate(value))
    }

    return result
  }

  public unpackValue(value: any): Result<any> {
    return Result.ok(this.descriptor.isReadable ? value : undefined)
  }
}
