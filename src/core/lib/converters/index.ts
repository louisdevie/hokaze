/**
 * A converter object that implements a conversion both for input and output.
 */
export type Converter<V, T> = { unpack(dto: T): V; pack(value: V): T }

/**
 * A converter object that only implements a conversion for deserialisation. The value is not modified when it is
 * serialised.
 */
export type InputConverter<V extends T, T> = { unpack(dto: T): V }

/**
 * A converter object that only implements a conversion for serialisation. The value is not modified when it is
 * deserialised.
 */
export type OutputConverter<V, T extends V> = { pack(value: V): T }

/**
 * A partial converter object.
 */
export type AnyConverter<V, T> = Converter<V, T> | InputConverter<V & T, T> | OutputConverter<V, V & T>

/**
 * A converter that implements an output conversion through its valueOf method (or its toString method when converting
 * into strings).
 */
export type OutputSelfConverter<T> = { valueOf(): T } | (T extends string ? object : never)

/**
 * A converter that implements an input conversion through its constructor and can convert itself back on output.
 */
export type InputSelfConverter<C extends OutputSelfConverter<T>, T> = { new (dto: T): C }

/**
 * A converter that implements an input conversion through its constructor, and doesn't need any conversion on output
 * because it is assignable to the type of the DTO.
 */
export type TransparentSelfConverter<C extends T, T> = { new (dto: T): C }
