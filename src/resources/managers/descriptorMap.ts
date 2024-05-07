import { Manager } from '@module/resources/managers/index'
import { Key, ResourceDescriptor } from '..'
import { Infer, Likelihood } from '@module/inference'
import { Field, KeyKind } from '@module/fields'
import { Internal, Throw } from '@module/errors'
import { chooseKey } from '@module/resources/helpers'
import { BaseManager } from '@module/resources/managers/base'

export class FieldDescriptorsManager<T> extends BaseManager<T> {
  private readonly _key: string
  private readonly _keyKind: KeyKind
  private readonly _fieldDescriptors: Record<string, Field<unknown>>
  private readonly _fieldList: string[]

  public constructor(descriptor: ResourceDescriptor) {
    super()
    if (Array.isArray(descriptor.fields)) Internal.descriptorNotSupported()
    this._fieldDescriptors = descriptor.fields
    this._fieldList = Object.keys(this._fieldDescriptors)

    let fieldsInfo: [string, Likelihood][]
    fieldsInfo = this._fieldList.map((name) => [
      name,
      this._fieldDescriptors[name].isKey({
        fieldName: name,
        resourceName: descriptor.name,
      }),
    ])
    this._key = chooseKey(descriptor.name, fieldsInfo)

    const keyField = this._fieldDescriptors[this._key]
    if (keyField.keyKind == null) Throw.badTypeKey(descriptor.name, this._key)
    if (keyField.isOptional) Throw.optionalKey(descriptor.name, this._key)
    if (keyField.isNullable) Throw.nullableKey(descriptor.name, this._key)
    if (!keyField.isReadable) Throw.unreadableKey(descriptor.name, this._key)
    this._keyKind = keyField.keyKind
  }

  public get key(): keyof T {
    return this._key as keyof T
  }

  public get keyKind(): KeyKind {
    return this._keyKind
  }

  public createInstance(): T {
    const object = {} as any

    for (const property of this._fieldList) {
      const descriptor = this._fieldDescriptors[property]

      let initialValue
      if (property === this._key) {
        initialValue = null
      } else {
        initialValue = descriptor.blankValue
      }

      object[property] = initialValue
    }

    return object as T
  }
}
