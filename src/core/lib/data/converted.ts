import {DataDescriptor} from "~/data/index";
import {AnyData} from "~/data/base";
import {Converter} from "~/converters";

/**
 * A descriptor that has been wrapped with a converter.
 * @template V The type of the data described by this object.
 * @template T The underlying type of the data being transferred.
 */
export class ConvertedData<V, T> implements DataDescriptor<V> {
  private readonly _baseData: AnyData<T, unknown>
  private readonly _converter: Converter<V, T>

  /**
   * Decorates a base descriptor with a custom mapper.
   * @param baseData The descriptor to wrap.
   * @param converter The converter.
   * @protected
   */
  public constructor(baseData: AnyData<T, unknown>, converter: Converter<V, T>) {
    this._baseData = baseData
    this._converter = converter
  }

  public get isReadable(): boolean {
    return this._baseData.isReadable
  }

  public get isWritable(): boolean {
    return this._baseData.isWritable
  }

  public get isOptional(): boolean {
    return this._baseData.isOptional
  }

  public makeMapper(): Mapper<V> {
    return new WrappedMapper(this._converter, this._baseData.makeMapper())
  }

  /**
   * Change the "blank" value used when creating new objects. If the value is *mutable* (e.g. if it is an object),
   * consider using the other overload instead.
   * @param value The new value to use.
   */
  public withBlankValue(value: V): ConvertedData<V, T>
  /**
   * Change the "blank" value used when creating new objects.
   * @param factory A function that will create a new value each time it is called.
   */
  public withBlankValue(factory: () => V): ConvertedData<V, T>
  public withBlankValue(factoryOrValue: (() => V) | V): ConvertedData<V, T> {
    let blankValueFactory
    if (factoryOrValue instanceof Function) {
      blankValueFactory = factoryOrValue
    } else {
      blankValueFactory = (): V => factoryOrValue
    }
    return new ConvertedData(this._baseData, this._converter, blankValueFactory)
  }
}
