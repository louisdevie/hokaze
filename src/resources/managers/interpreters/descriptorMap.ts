import type { ResourceDescriptor } from '@module/resources'
import { Likelihood } from '@module/inference'
import { Field, KeyKind } from '@module/fields'
import { Internal, Throw } from '@module/errors'
import { chooseKey } from '@module/resources/helpers'
import type { DescriptorInterpreter } from '.'

export class DescriptorMapInterpreter implements DescriptorInterpreter {
  private readonly _resourceName: string
  private readonly _fieldDescriptors: Record<string, Field<unknown>>
  private readonly _fieldList: string[]

  public constructor(descriptor: ResourceDescriptor) {
    if (Array.isArray(descriptor.fields)) Internal.descriptorNotSupported()

    this._resourceName = descriptor.name
    this._fieldDescriptors = descriptor.fields
    this._fieldList = Object.keys(this._fieldDescriptors)
  }

  public findKey(): { property: string; kind: KeyKind } {
    let fieldsInfo: [string, Likelihood][]
    fieldsInfo = this._fieldList.map((name) => [
      name,
      this._fieldDescriptors[name].isKey({
        fieldName: name,
        resourceName: this._resourceName,
      }),
    ])
    const property = chooseKey(this._resourceName, fieldsInfo)

    const keyField = this._fieldDescriptors[property]
    if (keyField.keyKind == null) Throw.badTypeKey(this._resourceName, property)
    if (keyField.isOptional) Throw.optionalKey(this._resourceName, property)
    if (keyField.isNullable) Throw.nullableKey(this._resourceName, property)
    if (!keyField.isReadable) Throw.unreadableKey(this._resourceName, property)
    const kind = keyField.keyKind

    return { property, kind }
  }

  public createInstance(keyProperty: string | number | symbol | undefined): any {
    const object = {} as any

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

  public copy(from: Record<string, any>, to: Record<string, any>) {
    for (const property of this._fieldList) {
      to[property] = from[property]
    }
  }
}
