import { AnyField, FieldOpts, explicitBlankValue } from './any'
import { Ref } from '@module/reference'
import { CollectionResource } from '@module/resources'

type ReferenceForm = 'id' | 'idObject' | 'fullObject'

interface RefFieldOpts<R, N> extends FieldOpts<Ref<R> | N> {
  serializeAs?: ReferenceForm
}

/**
 * Describes a field that is a reference to another resource.
 *
 * @template R The type of the resource referenced.
 * @template N The nullability of the field.
 */
export class RefField<R, N> extends AnyField<Ref<R> | N, RefField<R, N>> {
  private readonly _resource: CollectionResource<R>
  private readonly _serializeAs: ReferenceForm

  public constructor(resource: CollectionResource<R>, copyFrom?: RefField<R, N>, options?: RefFieldOpts<R, N>) {
    super(copyFrom, options)

    this._resource = resource

    this._serializeAs = copyFrom?._serializeAs ?? options?.serializeAs ?? 'id'
  }

  protected get defaultBlankValue(): Ref<R> | N {
    return Ref.fromKey(this._resource, -1)
  }

  protected cloneAsSelf(options: RefFieldOpts<R, N>): RefField<R, N> {
    return new RefField<R, N>(this._resource, this, options)
  }

  //region Builder methods

  /**
   * Serialize the referenced item as an object containing only the key property.
   * This overrides the default behavior of serializing the reference as the key.
   */
  public get inObject(): RefField<R, N> {
    return this.cloneAsSelf({ serializeAs: 'idObject' })
  }

  /**
   * Serialize the referenced item as an object containing all the data of the referenced object.
   * This overrides the default behavior of serializing the reference as the key.
   */
  public get asObject(): RefField<R, N> {
    return this.cloneAsSelf({ serializeAs: 'fullObject' })
  }

  public override get optional(): RefField<R, N | undefined> {
    return new RefField<R, N | undefined>(this._resource, this, { isOptional: true })
  }

  public override get nullable(): RefField<R, N | null> {
    return new RefField<R, N | null>(this._resource, this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}

/**
 * Describes a field that references another resource.
 */
export function refFieldFactory<R>(resource: CollectionResource<R>): RefField<R, never> {
  return new RefField<R, never>(resource)
}
