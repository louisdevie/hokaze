import type { ResourceDescriptor } from '../../index'
import type { KeyKind } from '@module/fields'
import type { DescriptorInterpreter } from '.'
import { isImplicitId, Likelihood } from '@module/inference'
import { chooseKey } from '@module/resources/helpers'
import { Err, internal } from '@module/errors'

export class FieldListInterpreter implements DescriptorInterpreter {
  private readonly _resourceName: string
  private readonly _fieldList: string[]

  public constructor(descriptor: ResourceDescriptor) {
    if (!Array.isArray(descriptor.fields)) internal(Err.descriptorNotSupported)

    this._resourceName = descriptor.name
    this._fieldList = descriptor.fields
  }

  public findKey(): { property: string; kind: KeyKind } {
    const fieldsInfo: [string, Likelihood][] = this._fieldList.map((name) => [
      name,
      isImplicitId({
        fieldName: name,
        resourceName: this._resourceName,
      }),
    ])
    const property = chooseKey(this._resourceName, fieldsInfo)

    return { property, kind: 'integer' /* always assume a numeric id */ }
  }

  public createInstance(keyProperty: string | number | symbol | undefined): unknown {
    const object = {} as Record<string | number | symbol, unknown>
    if (keyProperty !== undefined) object[keyProperty] = null
    return object
  }

  public copy(from: Record<string, unknown>, to: Record<string, unknown>): void {
    for (const property of this._fieldList) {
      to[property] = from[property]
    }
  }
}
