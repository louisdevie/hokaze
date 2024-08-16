/*
import { AnyValue, AnyValueOptions, explicitBlankValue } from './any'
import { Ref } from '@module/reference'
import type { CollectionResource } from '@module/resources'

type ReferenceForm = 'id' | 'idObject' | 'fullObject'

interface JsonRefOpts<R, N> extends AnyValueOptions<Ref<R> | N> {
  serializeAs?: ReferenceForm
}

/!**
 * Describes a serialized value that is a reference to another resource.
 *
 * @template R The type of the resource referenced.
 * @template N Additional values the field can hold.
 *!/
export class JsonRef<R, N> extends AnyValue<Ref<R> | N, JsonRef<R, N>> {
  private readonly _resource: CollectionResource<R>
  private readonly _serializeAs: ReferenceForm

  public constructor(resource: CollectionResource<R>, copyFrom?: JsonRef<R, N>, options?: JsonRefOpts<R, N>) {
    super(copyFrom, options)

    this._resource = resource

    this._serializeAs = copyFrom?._serializeAs ?? options?.serializeAs ?? 'id'
  }

  protected makeDefaultBlankValue(): Ref<R> | N {
    return Ref.fromKey(this._resource, -1)
  }

  protected cloneAsSelf(options: JsonRefOpts<R, N>): JsonRef<R, N> {
    return new JsonRef<R, N>(this._resource, this, options)
  }

  //region Builder methods

  /!**
   * Serialize the referenced item as an object containing only the key property.
   * This overrides the default behavior of serializing the reference as the key.
   *!/
  public get inObject(): JsonRef<R, N> {
    return this.cloneAsSelf({ serializeAs: 'idObject' })
  }

  /!**
   * Serialize the referenced item as an object containing all the data of the referenced object.
   * This overrides the default behavior of serializing the reference as the key.
   *!/
  public get asObject(): JsonRef<R, N> {
    return this.cloneAsSelf({ serializeAs: 'fullObject' })
  }

  public override get optional(): JsonRef<R, N | undefined> {
    return new JsonRef<R, N | undefined>(this._resource, this, {
      isOptional: true,
    })
  }

  public override get nullable(): JsonRef<R, N | null> {
    return new JsonRef<R, N | null>(this._resource, this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}

/!**
 * Describes a JSON value that is a reference to another resource.
 *!/
export function jsonRefFactory<R>(resource: CollectionResource<R>): JsonRef<R, never> {
  return new JsonRef<R, never>(resource)
}
*/
