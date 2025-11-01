import {AnyConverter, Converter, InputSelfConverter, OutputSelfConverter, TransparentSelfConverter} from "."

const identity = <A>(a: A): A => a

export function resolveConverter<V, T>(converter: AnyConverter<V, T>): Converter<V, T> {
  if ('unpack' in converter) {
    if ('pack' in converter) {
      return converter
    } else {
      return {unpack: converter.unpack.bind(converter), pack: identity<V & T>}
    }
  } else if ('pack' in converter) {
    return {unpack: identity<V & T>, pack: converter.pack.bind(converter)}
  } else {
    throw new Error("A converter must define at least an 'unpack' or a 'pack' operation.")
  }
}

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
      // if the class doesn't override valueOf, its is expected to implement toString instead
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return instance.toString() as T
    } else {
      return primitive as T
    }
  }
}

export function resolveSelfConverter<C extends OutputSelfConverter<T>, T>(
  cls: InputSelfConverter<C, T>,
): Converter<C, T> {
  return new SelfConverterAdapter(cls)
}


export class TransparentSelfConverterAdapter<C extends T, T> implements Converter<C, T> {
  private readonly _cls: TransparentSelfConverter<C, T>

  public constructor(cls: TransparentSelfConverter<C, T>) {
    this._cls = cls
  }

  public unpack(dto: T): C {
    return new this._cls(dto)
  }

  public pack(value: C): T {
    return value
  }
}


export function resolveTransparentSelfConverter<C extends T, T>(cls: TransparentSelfConverter<C, T>): Converter<C, T> {
  return new TransparentSelfConverterAdapter(cls)
}
