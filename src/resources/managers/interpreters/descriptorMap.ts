import type { ResourceDescriptor } from '@module/resources'
import { Likelihood } from '@module/inference'
import { Field, KeyKind } from '@module/fields'
import { Err, internal, throwError } from '@module/errors'
import { chooseKey } from '@module/resources/helpers'
import type { DescriptorInterpreter } from '.'
import __ from '@module/locale'

export class DescriptorMapInterpreter implements DescriptorInterpreter {
  private readonly _resourceName: string
  private readonly _fieldDescriptors: Record<string, Field<unknown>>
  private readonly _fieldList: string[]

  public constructor(descriptor: ResourceDescriptor) {
    if (Array.isArray(descriptor.fields)) internal(Err.descriptorNotSupported)

    this._resourceName = descriptor.name
    this._fieldDescriptors = descriptor.fields
    this._fieldList = Object.keys(this._fieldDescriptors)
  }

  public findKey(): { property: string; kind: KeyKind } {
    const fieldsInfo: [string, Likelihood][] = this._fieldList.map((name) => [
      name,
      this._fieldDescriptors[name].isKey({
        fieldName: name,
        resourceName: this._resourceName,
      }),
    ])
    const property = chooseKey(this._resourceName, fieldsInfo)

    const keyField = this._fieldDescriptors[property]
    if (keyField.keyKind == null) throwError(__.badKeyType(this._resourceName, property))
    if (keyField.isOptional) throwError(__.optionalKey(this._resourceName, property))
    if (keyField.isNullable) throwError(__.nullableKey(this._resourceName, property))
    if (!keyField.isReadable) throwError(__.unreadableKey(this._resourceName, property))
    const kind = keyField.keyKind

    return { property, kind }
  }

  public createInstance(keyProperty: string | number | symbol | undefined): unknown {
    const object = {} as Record<string, unknown>

    for (const property of this._fieldList) {
      const descriptor = this._fieldDescriptors[property]

      let initialValue
      if (property === keyProperty) {
        initialValue = null
      } else {
        initialValue = descriptor.blankValue
      }

      object[property] = initialValue
    }

    return object
  }

  public copy(from: Record<string, unknown>, to: Record<string, unknown>): void {
    for (const property of this._fieldList) {
      to[property] = from[property]
    }
  }
}
