import { Field } from '@module/fields'
import { MappedField } from './base'
import { AnyMappedField } from './any'

export interface MappingFactory {
  makeGenericMapping(field: Field<unknown>): MappedField
}

export class MappingFactoryImpl implements MappingFactory {
  private _name: string

  public constructor(name: string) {
    this._name = name
  }

  public makeGenericMapping(field: Field<unknown>): MappedField {
    return new AnyMappedField(this._name, field)
  }
}
