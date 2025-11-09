/**
 * The result of a validation operation.
 */
export class ValidationResult {
  private readonly _errors: Map<string, string> | null

  private constructor(errors: Map<string, string> | null) {
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
    return new ValidationResult(new Map([['$', reason]]))
  }

  public hasError(path?: string): boolean {
    return this._errors !== null && this._errors.has(path ?? '')
  }

  public getError(path: string): string | undefined {
    return this._errors?.get(path ?? '')
  }

  public mergeWith(other: ValidationResult): ValidationResult {
    if (other._errors === null) return this
    if (this._errors === null) return other

    const errors = new Map(this._errors.entries())
    for (const [path, reason] of other._errors.entries()) {
      errors.set(path, reason)
    }
    return new ValidationResult(errors)
  }

  public mergeWithProperty(prop: string, other: ValidationResult): ValidationResult {
    if (other._errors === null) return this

    const errors = new Map(this._errors?.entries())
    for (const [path, reason] of other._errors.entries()) {
      const nestedPath = `$.${prop}${path.substring(1)}`
      errors.set(nestedPath, reason)
    }
    return new ValidationResult(errors)
  }

  public mergeWithItem(index: number, other: ValidationResult): ValidationResult {
    if (other._errors === null) return this

    const errors = new Map(this._errors?.entries())
    for (const [path, reason] of other._errors.entries()) {
      const nestedPath = `$[${index}]${path.substring(1)}`
      errors.set(nestedPath, reason)
    }
    return new ValidationResult(errors)
  }
}

/**
 * An unsuccessful {@link ValidationResult} that was thrown.
 */
export class ValidationError extends Error {
  private readonly _errors: Map<string, string>

  public constructor(errors: Map<string, string>) {
    super('Validation error')
    this._errors = errors
  }

  public hasError(path?: string): boolean {
    return this._errors.has(path ?? '$')
  }

  public getError(path?: string): string | undefined {
    return this._errors.get(path ?? '$')
  }
}
