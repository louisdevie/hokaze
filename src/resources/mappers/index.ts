import type { Key, ObjectTypeFromFields, ResourceFields } from '@module/resources'
import { AutoMappedField } from './auto'
import { MappingFactoryImpl } from '@module/resources/mappers/factory'
import { Result } from '@module/result'
import { MappedField } from './base'

export { KeyExtractionMethod } from './keyExtraction'

export class Mapper<Descriptor extends ResourceFields, ItemType extends ObjectTypeFromFields<Descriptor>> {
  private readonly _send: Map<string, MappedField>
  private readonly _receive: Map<string, MappedField>

  public constructor(fieldDescriptors: Descriptor) {
    this._send = new Map()
    this._receive = new Map()

    for (const field of Mapper.mapFields(fieldDescriptors)) {
      this._send.set(field.modelProperty, field)
      this._receive.set(field.transferProperty, field)
    }
  }

  public packItem(item: ItemType): Result<Record<string, unknown>> {
    const dto: Record<string, unknown> = {}
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

  public packItemsArray(items: ItemType[]): Result<Record<string, unknown>[]> {
    return Result.mapArray(items, (item) => this.packItem(item), Mapper.joinArrayErrors.bind(Mapper))
  }

  public unpackItem(dto: unknown): Result<ItemType> {
    const item: Record<string, unknown> = {}
    let result: Result<ItemType>

    if (dto === null) {
      result = Result.error('Could not unpack null value.')
    } else if (typeof dto !== 'object' || Array.isArray(dto)) {
      result = Result.error(`Could not unpack value of type ${typeof dto}.`)
    } else {
      const errors = []
      const dtoRecord = dto as Record<string, unknown>

      for (const property in dtoRecord) {
        const mapping = this._receive.get(property)
        if (mapping !== undefined) {
          const mapped = mapping.unpackValue(dtoRecord[property])
          if (mapped.success) {
            item[mapping.modelProperty] = mapped.value
          } else {
            errors.push(`[${property}] ${mapped.error}`)
          }
        }
      }

      if (errors.length > 0) {
        result = Result.error('Errors when unpacking item: ' + errors.join(', '))
      } else {
        result = Result.ok(item as ItemType)
      }
    }

    return result
  }

  public unpackItemsArray(dto: unknown[]): Result<ItemType[]> {
    return Result.mapArray(dto, (itemDto) => this.unpackItem(itemDto), Mapper.joinArrayErrors.bind(Mapper))
  }

  public tryToUnpackKey(dto: unknown, keyProperty: string): Result<Key> {
    let idFound: Result<Key> = Result.error('')

    const mapping = this._send.get(keyProperty)
    if (mapping !== undefined && typeof dto === 'object' && dto !== null) {
      const mapped = mapping.unpackValue((dto as Record<string, unknown>)[mapping.transferProperty])
      if ((mapped.success && typeof mapped.value === 'string') || typeof mapped.value === 'number') {
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
