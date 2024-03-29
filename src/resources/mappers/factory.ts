import { Field } from '@module/fields'
import { MappedField } from '.'

export interface MappingFactory {
  makeGenericMapping(field: Field<unknown>): MappedField
}

export class MappingFactoryImpl implements MappingFactory {
  private _name: string

  public constructor(name: string) {
    this._name = name
  }

  public makeGenericMapping(field: Field<unknown>): MappedField {
    throw new Error('Method not implemented.')
  }
}
