import { MappedField } from '.'
import { Field } from '@module/fields'
import __ from '@module/locale'

export class AnyMappedField<T> extends MappedField {
  private readonly _descriptor: Field<T>

  public constructor(name: string, descriptor: Field<T>) {
    super(name, name)

    this._descriptor = descriptor
  }

  protected get descriptor(): Field<T> {
    return this._descriptor
  }

  public packValue(value: any): any {
    if (!this.descriptor.isWritable) {
      value = undefined
    }

    if (!this.descriptor.isOptional) {
      throw new Error
    }

    if (this.descriptor.)

    return value
  }

  public unpackValue(value: any): any {
    throw new Error('Method not implemented.')
  }
}
