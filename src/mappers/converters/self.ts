import { Converter, InputSelfConverter, OutputSelfConverter, TransparentSelfConverter } from '.'

export class SelfConverterAdapter<C extends OutputSelfConverter<T>, T> implements Converter<C, T> {
  private readonly _cls: InputSelfConverter<C, T>

  public constructor(cls: InputSelfConverter<C, T>) {
    this._cls = cls
  }

  public unpack(dto: T & string): C {
    return new this._cls(dto)
  }

  public pack(instance: C): T {
    const primitive = instance.valueOf()
    if (primitive instanceof this._cls) {
      return instance.toString() as T
    } else {
      return primitive as T
    }
  }
}

export class TransparentSelfConverterAdapter<C extends T, T> implements Converter<C, T> {
  private readonly _cls: TransparentSelfConverter<C, T>

  constructor(cls: TransparentSelfConverter<C, T>) {
    this._cls = cls
  }

  public unpack(dto: T): C {
    return new this._cls(dto)
  }

  public pack(value: C): T {
    return value
  }
}
