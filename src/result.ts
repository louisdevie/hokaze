import { ValidationResult } from './validation'

type ResultVariant<T> = { success: true; value: T } | { success: false; error: string }

export class Result<T> {
  private readonly _variant: ResultVariant<T>

  private constructor(init: ResultVariant<T>) {
    this._variant = init
  }

  public static ok<T>(value: T): Result<T> {
    return new Result({ success: true, value })
  }

  public static error<T>(error: string): Result<T> {
    return new Result({ success: false, error })
  }

  public static withValidation<T>(value: T, validation: ValidationResult): Result<T> {
    return validation.isValid ? Result.ok(value) : Result.error(validation.reason)
  }

  public static mapArray<T, U>(array: T[], mapFn: (item: T) => Result<U>, concatErrsFn: (errors: string[]) => string): Result<U[]> {
    const mappedValues: U[] = []
    const errors: string[] = []

    for (const item of array) {
      const mapped = mapFn(item)
      if (mapped.success) {
        mappedValues.push(mapped.value!)
      } else {
        errors.push(mapped.error!)
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

  public get error(): string | undefined {
    return !this._variant.success ? this._variant.error : undefined
  }
}
