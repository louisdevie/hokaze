import type { ReferencableValue, RefLoadingStrategy, RefSerializationForm } from '@module/data/serialized/ref'
import { throwError } from '@module/errors'
import L from '@module/locale'
import { type EagerReferenceLoader, ValueMapper } from '@module/mappers/serialized'
import type { ObjectMapper } from '@module/mappers/serialized/object'
import { Ref } from '@module/reference'
import type { Key } from '@module/resources'

export class JsonRefMapper<R, N> extends ValueMapper<Ref<R> | N> {
  private readonly _form: RefSerializationForm
  private readonly _resource: ReferencableValue<R>
  private readonly _loading: RefLoadingStrategy
  private _itemMapper?: ObjectMapper<R>

  public constructor(resource: ReferencableValue<R>, form: RefSerializationForm, loading: RefLoadingStrategy) {
    super()
    this._resource = resource
    this._form = form
    this._loading = loading
  }

  private get objectMapper(): ObjectMapper<R> {
    this._itemMapper ??= this._resource.getMapper()
    return this._itemMapper
  }

  public packValue(value: Ref<R> | N): unknown {
    if (value instanceof Ref) {
      switch (this._form) {
        case 'id':
          return value.key

        case 'idObject':
          return { [this._resource.keyProperty]: value.key }

        case 'fullObject':
          if (value.value === undefined) throwError(L.refIsUnloaded)
          return this.objectMapper.packValue(value.value)
      }
    } else {
      return value
    }
  }

  public unpackValue(response: unknown, refLoader: EagerReferenceLoader): Ref<R> | N {
    let unpacked
    if (response === undefined || response === null) {
      unpacked = response as N
    } else if (typeof response === 'string' || typeof response === 'number') {
      unpacked = Ref.fromKey(this._resource, response)
    } else {
      const ref = this.objectMapper.tryToUnpackRef(response, refLoader)
      if (ref.found === 'key') {
        unpacked = Ref.fromKey(this._resource, ref.key as Key)
      } else if (ref.found === 'value') {
        unpacked = Ref.fromValue(this._resource, ref.value)
      } else {
        throw new Error(`Expected a reference, got ${JSON.stringify(response)}`)
      }
    }
    if (this._loading === 'eager' && unpacked instanceof Ref) {
      refLoader.register(unpacked)
    }
    return unpacked
  }
}
