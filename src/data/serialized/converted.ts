import type { ObjectDescriptor, FieldRoleHints, Likelihood } from '@module'
import { KeyKind } from '@module/data/serialized'
import { ObjectValue } from '@module/data/serialized/object'
import { type Converter, WrappedMapper } from '@module/mappers/converters'
import { WrappedObjectMapper } from '@module/mappers/converters/wrapped'
import { ObjectMapper } from '@module/mappers/serialized/object'
import type { ValidationResult } from '@module/validation'

/**
 * A descriptor that has been wrapped with a converter.
 * @template V The type of the data described by this object.
 * @template T The underlying type of the data being transferred.
 */
export class ConvertedObject<V, T extends Record<string, unknown>> implements ObjectDescriptor<V> {
  private readonly _baseObject: ObjectValue<T, never>
  private readonly _converter: Converter<V, T>
  private readonly _blankValueFactory: (() => V) | null

  /**
   * Decorates a base descriptor with a custom mapper.
   * @param baseObject The descriptor to wrap.
   * @param converter The converter.
   * @param blankValueFactory A blank value factory that directly produces values of the mapped type.
   * @protected
   */
  public constructor(
    baseObject: ObjectValue<T, never>,
    converter: Converter<V, T>,
    blankValueFactory: (() => V) | null,
  ) {
    this._baseObject = baseObject
    this._converter = converter
    this._blankValueFactory = blankValueFactory
  }

  public makeBlankValue(): V {
    return this._blankValueFactory !== null ?
        this._blankValueFactory()
      : this._converter.unpack(this._baseObject.makeBlankValue())
  }

  public validate(value: V): ValidationResult {
    return this._baseObject.validate(this._converter.pack(value))
  }

  public get isReadable(): boolean {
    return this._baseObject.isReadable
  }

  public get isWritable(): boolean {
    return this._baseObject.isWritable
  }

  public get isOptional(): boolean {
    return this._baseObject.isOptional
  }

  public get isNullable(): boolean {
    return this._baseObject.isNullable
  }

  public get keyKind(): null {
    return null
  }

  public isKey(hints: FieldRoleHints): Likelihood {
    return this._baseObject.isKey(hints)
  }

  public findKey(resourceName: string): { property: string; kind: KeyKind } {
    return this._baseObject.findKey(resourceName)
  }

  public makeMapper(): ObjectMapper<V> {
    return new WrappedObjectMapper(this._converter, this._baseObject.makeMapper())
  }

  /**
   * Change the "blank" value used when creating new objects. If the value is *mutable* (e.g. if it is an object),
   * consider using the other overload instead.
   * @param value The new value to use.
   */
  public withBlankValue(value: V): ConvertedObject<V, T>
  /**
   * Change the "blank" value used when creating new objects.
   * @param factory A function that will create a new value each time it is called.
   */
  public withBlankValue(factory: () => V): ConvertedObject<V, T>
  public withBlankValue(factoryOrValue: (() => V) | V): ConvertedObject<V, T> {
    let blankValueFactory
    if (factoryOrValue instanceof Function) {
      blankValueFactory = factoryOrValue
    } else {
      blankValueFactory = (): V => factoryOrValue
    }
    return new ConvertedObject(this._baseObject, this._converter, blankValueFactory)
  }
}
