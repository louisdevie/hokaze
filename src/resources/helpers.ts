import { UrlSearchArgs } from '@module/url'
import { Likelihood } from '@module/inference'
import { throwError } from '@module/errors'
import __ from '@module/locale'

export type OptionalSearchArgs = UrlSearchArgs | undefined

export function noSearch(search: OptionalSearchArgs): boolean {
  return search === undefined || Object.keys(search).length === 0
}

export function chooseKey(resourceName: string, fields: [string, Likelihood][]): string {
  let possibleKeys: string[] = []
  let highestLikelihood = Likelihood.implicit(0)
  for (const [name, likelihood] of fields) {
    if (likelihood.isMoreLikelyThan(highestLikelihood)) {
      highestLikelihood = likelihood
      possibleKeys = [name]
    } else if (likelihood.isAsLikelyAs(highestLikelihood)) {
      possibleKeys.push(name)
    }
  }

  if (possibleKeys.length === 1 && highestLikelihood.isMoreLikelyThan(Likelihood.implicit(0))) {
    return possibleKeys[0]
  } else {
    throwError(__.couldNotInferKey(resourceName))
  }
}
