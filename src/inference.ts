import { FieldRoleHints } from '@module/fields'

/**
 * Likelihood for inferred properties. If it is not explicit, a number between 0 (absolutely not) and 10 (surely)
 * indicates the level of likelihood. The {@link Infer} class will always return *implicit* variants, the *explicit*
 * variant is to be used by other parts of the code.
 */
export type Likelihood = { explicit: true } | { explicit: false; level: number }

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

    return { explicit: false, level: likelihoodLevel }
  }

  private static cleanUpIdentifier(identifier: string): string {
    return identifier.toLowerCase().replace(/[^a-z]/gi, '')
  }
}
