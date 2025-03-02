import { ReferenceForm } from '@module/data/serialized/ref'
import { ValueMapper } from '@module/mappers/serialized'
import { ObjectMapper } from '@module/mappers/serialized/object'
import { Ref } from '@module/reference'
import { CollectionResource, Key } from '@module/resources'

export class JsonRefMapper<R, N> extends ValueMapper<Ref<R> | N> {
  private readonly _form: ReferenceForm
  private readonly _resource: CollectionResource<R>
  private _itemMapper?: ObjectMapper<R>

  public constructor(form: ReferenceForm, resource: CollectionResource<R>) {
    super()
    this._form = form
    this._resource = resource
  }

  private get objectMapper(): ObjectMapper<R> {
    this._itemMapper ??= this._resource.descriptor.makeMapper()
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
          if (value.value === undefined) throw new Error('Cannot serialize ref as a full object if it not loaded.')
          return this.objectMapper.packValue(value.value)
      }
    } else {
      return value
    }
  }

  public unpackValue(response: unknown): Ref<R> | N {
    if (response === undefined || response === null) {
      return response as N
    } else if (typeof response === 'string' || typeof response === 'number') {
      return Ref.fromKey(this._resource, response)
    } else {
      const ref = this.objectMapper.tryToUnpackRef(response)
      if (ref.found === 'key') {
        return Ref.fromKey(this._resource, ref.key as Key)
      } else if (ref.found === 'value') {
        return Ref.fromValue(this._resource, ref.value)
      } else {
        throw new Error(`Expected a reference, got ${JSON.stringify(response)}`)
      }
    }
  }
}
