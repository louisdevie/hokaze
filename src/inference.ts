import { FieldRoleHints } from '@module/fields'

/**
 * Likelihood for inferred properties.
 */
export class Likelihood {
  private readonly _isExplicit: boolean
  private readonly _level: number

  private constructor(isExplicit: boolean, level: number) {
    this._isExplicit = isExplicit
    this._level = level
  }

  /**
   * Creates a {@link Likelihood} instance that indicates a property implicitly declared by the user. This will always
   * be considered "more likely" than any implicit likelihood.
   */
  public static explicit(): Likelihood {
    return new Likelihood(true, 0)
  }

  /**
   * Creates a {@link Likelihood} instance that indicates a property that was inferred by the library. The {@link Infer}
   * class always returns this variant of likelihood.
   * @param level A number indicating a likelihood between 0 (absolutely not) and 10 (surely).
   */
  public static implicit(level: number): Likelihood {
    return new Likelihood(false, level)
  }

  private compareTo(other: Likelihood): number {
    let result = (this._isExplicit ? 1 : 0) - (other._isExplicit ? 1 : 0)

    if (result === 0) {
      // both are as explicit
      result = this._level - other._level
    }

    return result
  }

  /**
   * Checks whether this likelihood is *strictly* superior to the other.
   * @param other The other instance to compare to.
   */
  public isMoreLikelyThan(other: Likelihood): boolean {
    return this.compareTo(other) > 0
  }

  /**
   * Checks whether this likelihood is *strictly* inferior to the other.
   * @param other The other instance to compare to.
   */
  public isLessLikelyThan(other: Likelihood): boolean {
    return this.compareTo(other) < 0
  }

  /**
   * Checks whether this likelihood is equal to the other.
   * @param other The other instance to compare to.
   */
  public isAsLikelyAs(other: Likelihood): boolean {
    return this.compareTo(other) === 0
  }
}

export class Infer {
  private static readonly IDENTIFIER_KEYWORD = 'id'

  /**
   * Determines the likelihood of a field being the identifier of a given resource.
   * @param hints Hints about the role of the field.
   */
  public static isImplicitId(hints: FieldRoleHints): Likelihood {
    let cleanFieldName = this.cleanUpIdentifier(hints.fieldName)
    let cleanResourceName = this.cleanUpIdentifier(hints.resourceName)
    let resourceNamePlusId = cleanResourceName + this.IDENTIFIER_KEYWORD

    let likelihoodLevel =
      // "somethingId" -> very likely
      cleanFieldName === resourceNamePlusId ? 8
        // "id" -> maybe
      : cleanFieldName === this.IDENTIFIER_KEYWORD ? 5
        // "blabla_Id_blabla" -> not likely at all
      : cleanFieldName.includes(this.IDENTIFIER_KEYWORD) ? 1
        // otherwise it's surely not and id
      : 0

    return Likelihood.implicit(likelihoodLevel)
  }

  private static cleanUpIdentifier(identifier: string): string {
    return identifier.toLowerCase().replace(/[^a-z]/gi, '')
  }
}
