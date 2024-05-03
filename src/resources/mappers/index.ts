import { Key, ResourceDescriptor, ResourceFields, ResourceItemType } from '@module/resources'
import { AutoMappedField } from './auto'
import { MappingFactoryImpl } from '@module/resources/mappers/factory'
import { Result } from '@module/result'
import { MappedField } from './base'

export class Mapper<Descriptor extends ResourceDescriptor, ItemType extends ResourceItemType<Descriptor>> {
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

  public packItem(item: ItemType): Result<any> {
    const dto: any = {}
    const errors = []

    for (const property in item) {
      const mapping = this._send.get(property)
      if (mapping !== undefined) {
        const mapped = mapping.packValue(item[property])
        if (mapped.success) {
          dto[mapping.transferProperty] = mapped.value
        } else {
          errors.push(`[${property}] ${mapped.error}`)
        }
      }
    }

    let result
    if (errors.length > 0) {
      result = Result.error('Errors when packing item: ' + errors.join(', '))
    } else {
      result = Result.ok(dto)
    }

    return result
  }

  public packItemsArray(items: ItemType[]): Result<any[]> {
    return Result.mapArray(items, (item) => this.packItem(item), Mapper.joinArrayErrors)
  }

  public unpackItem(dto: any): Result<ItemType> {
    const item: any = {}
    const errors = []

    for (const property in dto) {
      const mapping = this._receive.get(property)
      if (mapping !== undefined) {
        const mapped = mapping.unpackValue(dto[property])
        if (mapped.success) {
          item[mapping.modelProperty] = mapped.value
        } else {
          errors.push(`[${property}] ${mapped.error}`)
        }
      }
    }

    let result: Result<ItemType>
    if (errors.length > 0) {
      result = Result.error('Errors when unpacking item: ' + errors.join(', '))
    } else {
      result = Result.ok(item as ItemType)
    }

    return result
  }

  public unpackItemsArray(dtos: any[]): Result<ItemType[]> {
    return Result.mapArray(dtos, (dto) => this.unpackItem(dto), Mapper.joinArrayErrors)
  }

  public tryToUnpackKey(dto: any, keyProperty: string): Result<Key> {
    let idFound: Result<Key> = Result.error('')

    const mapping = this._send.get(keyProperty)
    if (mapping !== undefined) {
      const mapped = mapping.unpackValue(dto[mapping.transferProperty])
      if (mapped.success) {
        idFound = Result.ok(mapped.value)
      }
    }

    return idFound
  }

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

  private static joinArrayErrors(errors: [string, number][]): string {
    return errors.map(([error, i]) => `[${i}] ${error}`).join('; ')
  }
}
