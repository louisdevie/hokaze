/**
 * The result of a check.
 */
export class ValidationResult {
  private readonly _errors: Record<string, string> | null

  private constructor(errors: Record<string, string> | null) {
    this._errors = errors
  }

  public get isValid(): boolean {
    return this._errors === null
  }

  public throwIfInvalid(): void {
    if (this._errors !== null) {
      throw new ValidationError(this._errors)
    }
  }

  /**
   * Creates a *valid* result.
   */
  public static valid(): ValidationResult {
    return new ValidationResult(null)
  }

  /**
   * Creates an *invalid* result.
   * @param reason A sentence explaining what is wrong with the value.
   */
  public static invalid(reason: string): ValidationResult {
    return new ValidationResult({ $: reason })
  }

  public hasError(path: string): boolean {
    return this._errors !== null && path in this._errors
  }

  public getError(path: string): string | undefined {
    return this._errors !== null ? this._errors[path] : undefined
  }

  public mergeWith(other: ValidationResult): ValidationResult {
    if (other._errors === null) return this
    const errors = { ...this._errors, ...other._errors }
    return new ValidationResult(Object.keys(errors).length > 0 ? errors : null)
  }

  public mergeWithProperty(prop: string, other: ValidationResult): ValidationResult {
    if (other._errors === null) return this
    const nestedErrors: Record<string, string> = {}
    for (const path of Object.keys(other._errors)) {
      const nestedPath = `$.${prop}${path.substring(1)}`
      nestedErrors[nestedPath] = other._errors[path]
    }
    const errors = { ...this._errors, ...nestedErrors }
    return new ValidationResult(Object.keys(errors).length > 0 ? errors : null)
  }

  public mergeWithItem(index: number, other: ValidationResult): ValidationResult {
    if (other._errors === null) return this
    const nestedErrors: Record<string, string> = {}
    for (const path of Object.keys(other._errors)) {
      const nestedPath = `$[${index}]${path.substring(1)}`
      nestedErrors[nestedPath] = other._errors[path]
    }
    const errors = { ...this._errors, ...nestedErrors }
    return new ValidationResult(Object.keys(errors).length > 0 ? errors : null)
  }
}

/**
 * An unsuccessful {@link ValidationResult} that was thrown.
 */
export class ValidationError extends Error {
  private readonly _errors: Record<string, string>

  public constructor(errors: Record<string, string>) {
    super('Validation error')
    this._errors = errors
  }

  public hasError(path: string): boolean {
    return path in this._errors
  }

  public getError(path: string): string | undefined {
    return this._errors[path]
  }
}
