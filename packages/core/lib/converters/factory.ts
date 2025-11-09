import { PartialConverter, Converter, SelfConverter, TransparentSelfConverter } from '.'
import { isObject } from '~/helpers'

const identity = <A>(a: A): A => a

/**
 * Uses an identity function to implement the missing `pack` or `unpack` operation and make a two-way converter.
 * @internal
 */
export function resolveConverter<V, T>(converter: PartialConverter<V, T>): Converter<V, T> {
  if ('unpack' in converter) {
    if ('pack' in converter) {
      return converter
    } else {
      return { unpack: converter.unpack.bind(converter), pack: identity<V & T> }
    }
  } else if ('pack' in converter) {
    return { unpack: identity<V & T>, pack: converter.pack.bind(converter) }
  } else {
    throw new Error("A converter must define at least an 'unpack' or a 'pack' operation.")
  }
}

type ToPrimitiveHint = 'string' | 'number' | 'default'

class SelfConverterAdapter<V extends Object, T> implements Converter<V, T> {
  private readonly _cls: SelfConverter<V, T>
  private readonly _hint: ToPrimitiveHint

  public constructor(cls: SelfConverter<V, T>, hint: ToPrimitiveHint) {
    this._cls = cls
    this._hint = hint
  }

  public unpack(dto: T & string): V {
    return new this._cls(dto)
  }

  public pack(instance: V): T {
    let result: unknown = instance
    // if @@toPrimitive is present, use it
    if (Symbol.toPrimitive in instance && typeof instance[Symbol.toPrimitive] === 'function') {
      result = (instance[Symbol.toPrimitive] as Function)(this._hint)
    }
    if (isObject(result)) {
      if (this._hint === 'string') {
        // if the hint is "string", use toString before valueOf
        result = instance.toString()
        if (isObject(result)) {
          result = instance.valueOf()
        }
      } else {
        // if the hint is "number" or "default", use valueOf before toString
        result = instance.valueOf()
        if (isObject(result)) {
          result = instance.toString()
        }
      }
    }
    return result as T
  }
}

/**
 * Wrap a self-converting class in an object implementing the {@link Converter} interface.
 * @internal
 */
export function resolveSelfConverter<C extends Object, T>(
  cls: SelfConverter<C, T>,
  hint: ToPrimitiveHint,
): Converter<C, T> {
  return new SelfConverterAdapter(cls, hint)
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
