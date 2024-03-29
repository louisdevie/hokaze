import { MappedField } from '.'

export class AnyMappedField extends MappedField {
  constructor(fieldName: string) {
    super(fieldName, fieldName)
  }

  public packValue(value: any) {
    throw new Error('Method not implemented.')
  }
  public unpackValue(value: any) {
    throw new Error('Method not implemented.')
  }
}