/**
 * A converter object that implements a conversion both for input and output.
 */
export type Converter<V, T> = { unpack(dto: T): V; pack(value: V): T }

/**
 * A converter object that only implements a conversion for deserialisation. The value is not modified when it is
 * serialised.
 */
export type InputConverter<V, T> = { unpack(dto: T): V }

/**
 * A converter object that only implements a conversion for serialisation. The value is not modified when it is
 * deserialised.
 */
export type OutputConverter<V, T> = { pack(value: V): T }

/**
 * A converter object that implements a conversion one way or both ways.
 */
export type PartialConverter<V, T> = Converter<V, T> | InputConverter<V, T> | OutputConverter<V, T>

/**
 * A class that provides an input conversion through its constructor, and a mechanism to convert itself back into a
 * primitive on output (using {@link Symbol.toPrimitive}, {@link Object.valueOf} or {@link Object.toString}).
 */
export type SelfConverter<V extends Object, T> = { new (dto: T): V }

/**
 * A converter that implements an input conversion through its constructor, and doesn't need any conversion on output
 * because it is assignable to the type of the DTO.
 */
export type TransparentSelfConverter<C extends T, T> = { new (dto: T): C }

export { resolveConverter, resolveSelfConverter, resolveTransparentSelfConverter } from './factory'
