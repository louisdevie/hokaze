import type { ResourceDescriptor } from '../../index'
import type { KeyKind } from '@module/fields'
import type { DescriptorInterpreter } from '.'
import { Infer, Likelihood } from '@module/inference'
import { Internal } from '@module/errors'
import { chooseKey } from '@module/resources/helpers'

export class FieldListInterpreter implements DescriptorInterpreter {
  private readonly _resourceName: string
  private readonly _fieldList: string[]

  public constructor(descriptor: ResourceDescriptor) {
    if (!Array.isArray(descriptor.fields)) Internal.descriptorNotSupported()

    this._resourceName = descriptor.name
    this._fieldList = descriptor.fields
  }

  public findKey(): { property: string; kind: KeyKind } {
    let fieldsInfo: [string, Likelihood][]
    fieldsInfo = this._fieldList.map((name) => [
      name,
      Infer.isImplicitId({
        fieldName: name,
        resourceName: this._resourceName,
      }),
    ])
    const property = chooseKey(this._resourceName, fieldsInfo)

    return { property, kind: 'integer' /* always assume a numeric id */ }
  }

  public createInstance(keyProperty: string | number | symbol | undefined): any {
    const object = {} as any
    if (keyProperty !== undefined) object[keyProperty] = null
    return object
  }

  public copy(from: Record<string, any>, to: Record<string, any>) {
    for (const property of this._fieldList) {
      to[property] = from[property]
    }
  }
}
