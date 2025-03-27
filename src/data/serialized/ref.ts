import { AnyValue, AnyValueOptions } from './base'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonRefMapper } from '@module/mappers/serialized/json'
import { Ref, Referencable } from '@module/reference'
import type { CollectionResource } from '@module/resources'
import { ValidationResult } from '@module/validation'

export type RefSerializationForm = 'id' | 'idObject' | 'fullObject'

export type RefLoadingStrategy = 'lazy' | 'eager'

interface RefValueOpts<R, N> extends AnyValueOptions<Ref<R> | N> {
  serializeAs?: RefSerializationForm
  loading?: RefLoadingStrategy
}

/**
 * Describes a serialized value that is a reference to another resource.
 *
 * @template R The type of the referenced resource.
 * @template N Additional values the field can hold.
 */
export class RefValue<R, N> extends AnyValue<Ref<R> | N, RefValue<R, N>> {
  private readonly _resource: Referencable<R>
  private readonly _serializeAs: RefSerializationForm
  private readonly _loading: RefLoadingStrategy

  public constructor(resource: Referencable<R>, copyFrom?: RefValue<R, N>, options?: RefValueOpts<R, N>) {
    super(copyFrom, options)
    this._resource = resource
    this._serializeAs = options?.serializeAs ?? copyFrom?._serializeAs ?? 'id'
    this._loading = options?.loading ?? copyFrom?._loading ?? 'lazy'
  }

  protected makeDefaultBlankValue(): Ref<R> | N {
    return Ref.fromKey(this._resource, -1)
  }

  protected cloneAsSelf(options: RefValueOpts<R, N>): RefValue<R, N> {
    return new RefValue<R, N>(this._resource, this, options)
  }

  public makeMapper(): ValueMapper<Ref<R> | N> {
    return new JsonRefMapper(this._resource, this._serializeAs, this._loading)
  }

  public validate(value: Ref<R>): ValidationResult {
    let result = super.validate(value)
    if (result.isValid && value.value !== undefined) {
      result = this._resource.validate(value.value)
    }
    return result
  }

  /**
   * Serialize the resource item as an object containing only the key property.
   * This overrides the default behavior of serializing the reference as the key.
   */
  public get inObject(): RefValue<R, N> {
    return this.cloneAsSelf({ serializeAs: 'idObject' })
  }

  /**
   * Serialize the resource item as an object containing all the data of the resource object.
   * This overrides the default behavior of serializing the reference as the key.
   */
  public get asObject(): RefValue<R, N> {
    return this.cloneAsSelf({ serializeAs: 'fullObject' })
  }

  /**
   * Always load the referenced resource as soon as possible.
   */
  public get eager(): RefValue<R, N> {
    return this.cloneAsSelf({ loading: 'eager' })
  }

  public override get optional(): RefValue<R, N | undefined> {
    return new RefValue<R, N | undefined>(this._resource, this, {
      isOptional: true,
    })
  }

  public override get nullable(): RefValue<R, N | null> {
    return new RefValue<R, N | null>(this._resource, this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }
}

/**
 * Describes a JSON value that is a reference to another resource.
 */
export function jsonRefFactory<R>(resource: CollectionResource<R>): RefValue<R, never> {
  return new RefValue<R, never>(resource.asReferencable)
}
