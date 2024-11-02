import { FieldRoleHints } from '@module/data/serialized'

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
   * Creates a {@link Likelihood} instance that indicates a property that was inferred by the library. The inference
   * module always returns this variant of likelihood.
   * @param level A number indicating a likelihood between 0 (absolutely not) and 10 (surely).
   */
  public static implicit(level: number): Likelihood {
    return new Likelihood(false, level)
  }

  private compareTo(other: Likelihood): number {
    let result = (this._isExplicit ? 1 : 0) - (other._isExplicit ? 1 : 0)

    if (result === 0) {
      // they are both explicit or both not
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

const IDENTIFIER_KEYWORD = 'id'

/**
 * Determines the likelihood of a field being the identifier of a given resource.
 * @param hints Hints about the role of the field.
 */
export function isImplicitId(hints: FieldRoleHints): Likelihood {
  let lvl: number
  let likelihoodLevel

  if ((lvl = looksLike(hints.fieldName, IDENTIFIER_KEYWORD + hints.resourceName)) > 0) {
    // "idSomething" -> very likely, 8 to 10
    likelihoodLevel = 7 + lvl
  } else if ((lvl = looksLike(hints.fieldName, hints.resourceName + IDENTIFIER_KEYWORD)) > 0) {
    // "somethingId" -> same
    likelihoodLevel = 7 + lvl
  } else if ((lvl = looksLike(hints.fieldName, IDENTIFIER_KEYWORD)) > 0) {
    // "id" -> maybe, 5 to 7
    likelihoodLevel = 4 + lvl
  } else {
    // otherwise it's surely not and id
    likelihoodLevel = 0
  }

  return Likelihood.implicit(likelihoodLevel)
}

function looksLike(identifier1: string, identifier2: string): number {
  // exact same
  if (identifier1 === identifier2) {
    return 3
  }

  // ignore case
  identifier1 = identifier1.toLowerCase()
  identifier2 = identifier2.toLowerCase()
  if (identifier1 === identifier2) {
    return 2
  }

  // ignore non-alphanumeric characters
  identifier1 = identifier1.replace(/[^a-z0-9]/g, '')
  identifier2 = identifier2.replace(/[^a-z0-9]/g, '')
  if (identifier1 === identifier2) {
    return 1
  }

  return 0
}
