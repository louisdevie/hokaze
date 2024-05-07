import { ResourceDescriptor } from '..'
import { Infer, Likelihood } from '@module/inference'
import { KeyKind } from '@module/fields'
import { Internal } from '@module/errors'
import { chooseKey } from '@module/resources/helpers'
import { BaseManager } from '@module/resources/managers/base'

export class FieldListManager<T> extends BaseManager<T> {
  private readonly _key: string
  private readonly _fieldsList: string[]

  public constructor(descriptor: ResourceDescriptor) {
    super()
    if (!Array.isArray(descriptor.fields)) Internal.descriptorNotSupported()
    this._fieldsList = descriptor.fields

    let fieldsInfo: [string, Likelihood][]
    fieldsInfo = this._fieldsList.map((name) => [
      name,
      Infer.isImplicitId({
        fieldName: name,
        resourceName: descriptor.name,
      }),
    ])
    this._key = chooseKey(descriptor.name, fieldsInfo)
  }

  public get key(): keyof T {
    return this._key as keyof T
  }

  public get keyKind(): KeyKind {
    // assume a numeric id
    return 'integer'
  }

  public createInstance(): T {
    const object = {} as any
    object[this._key] = null
    return object as T
  }
}
