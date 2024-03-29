import { ResourceDescriptor, ResourceFields, ResourceItemType } from '@module/resources'
import { AutoMappedField } from './auto'
import { MappingFactoryImpl } from '@module/resources/mappers/factory'

export class Mapper<Descriptor extends ResourceDescriptor> {
  private readonly _send: Map<string, MappedField>
  private readonly _receive: Map<string, MappedField>

  public constructor(descriptor: Descriptor) {
    this._send = new Map()
    this._receive = new Map()

    for (const field of Mapper.mapFields(descriptor.fields)) {
      this._send.set(field.modelProperty, field)
      this._receive.set(field.transferProperty, field)
    }
  }

  public packItem(item: ResourceItemType<Descriptor>): any {}

  public unpackItem(dto: any): ResourceItemType<Descriptor> {}

  private static mapFields(fields: ResourceFields): MappedField[] {
    const mapped = []

    if (Array.isArray(fields)) {
      for (const fieldName of fields) {
        mapped.push(new AutoMappedField(fieldName))
      }
    } else {
      for (const property in fields) {
        const factory = new MappingFactoryImpl(property)
        mapped.push(fields[property].makeMapping(factory))
      }
    }

    return mapped
  }
}

export abstract class MappedField {
  private readonly _modelProperty: string
  private readonly _transferProperty: string

  protected constructor(modelProperty: string, transferProperty: string) {
    this._modelProperty = modelProperty
    this._transferProperty = transferProperty
  }

  public get modelProperty(): string {
    return this._modelProperty
  }

  public get transferProperty(): string {
    return this._transferProperty
  }

  public abstract packValue(value: any): any

  public abstract unpackValue(value: any): any
}
