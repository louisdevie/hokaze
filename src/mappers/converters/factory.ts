import { AnyConverter, Converter, InputSelfConverter, OutputSelfConverter, TransparentSelfConverter } from '.'
import { SelfConverterAdapter, TransparentSelfConverterAdapter } from './self'
import { throwError } from '@module/errors'
import L from '@module/locale'

const identity = <A>(a: A) => a

export function resolveConverter<V, T>(converter: AnyConverter<V, T>): Converter<V, T> {
  if ('unpack' in converter) {
    if ('pack' in converter) {
      return converter
    } else {
      return { unpack: converter.unpack, pack: identity<V & T> }
    }
  } else if ('pack' in converter) {
    return { unpack: identity<V & T>, pack: converter.pack }
  } else {
    throwError(L.emptyConverter)
  }
}

export function resolveSelfConverter<C extends OutputSelfConverter<T>, T>(
  cls: InputSelfConverter<C, T>,
): Converter<C, T> {
  return new SelfConverterAdapter(cls)
}

export function resolveTransparentSelfConverter<C extends T, T>(cls: TransparentSelfConverter<C, T>): Converter<C, T> {
  return new TransparentSelfConverterAdapter(cls)
}
