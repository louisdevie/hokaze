import { ValidationResult } from './validation'
import { Err, internal } from '@module/errors'

type ResultVariant<T, E> = { success: true; value: T } | { success: false; error: E }

export class Result<T, E = string> {
  private readonly _variant: ResultVariant<T, E>

  private constructor(init: ResultVariant<T, E>) {
    this._variant = init
  }

  public static ok<T>(value: T): Result<T, never> {
    return new Result({ success: true, value })
  }

  public static error<E>(error: E): Result<never, E> {
    return new Result({ success: false, error })
  }

  public static ofValidation<T>(value: T, validation: ValidationResult): Result<T, ValidationResult> {
    return validation.isValid ? Result.ok(value) : Result.error(validation)
  }

  public static mapArray<T, U>(
    array: T[],
    mapFn: (item: T) => Result<U>,
    concatErrsFn: (errors: [string, number][]) => string,
  ): Result<U[]> {
    const mappedValues: U[] = []
    const errors: [string, number][] = []

    for (let i = 0; i < array.length; i++) {
      const mapped = mapFn(array[i])
      if (mapped.success) {
        mappedValues.push(mapped.unwrap())
      } else {
        errors.push([mapped.unwrap_error(), i])
      }
    }

    let result: Result<U[]>
    if (errors.length > 0) {
      result = Result.error(concatErrsFn(errors))
    } else {
      result = Result.ok(mappedValues)
    }
    return result
  }

  public get success(): boolean {
    return this._variant.success
  }

  public get value(): T | undefined {
    return this._variant.success ? this._variant.value : undefined
  }

  public unwrap(): T {
    return this._variant.success ? this._variant.value : internal(Err.unwrappedError)
  }

  public get error(): E | undefined {
    return !this._variant.success ? this._variant.error : undefined
  }

  public unwrap_error(): E {
    return !this._variant.success ? this._variant.error : internal(Err.unwrappedValue)
  }
}
