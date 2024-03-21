import { expect } from '@jest/globals'
import type { MatcherFunction } from 'expect'
import { Likelihood } from '@module/inference'
import MatcherUtils = jest.MatcherUtils
import MatcherState = jest.MatcherState

function checkLikelihood(something: any) {
  let good = true

  if (typeof something !== 'object' || something === null) {
    good = false
  } else if (!something.hasOwnProperty('explicit')) {
    good = false
  } else if (something.explicit === false) {
    if (!something.hasOwnProperty('level') && typeof something.level !== 'number') {
      good = false
    }
  } else if (something.explicit !== true) {
    good = false
  }

  if (!good) throw new TypeError('These must be of type Likelihood!')
}

function printLikelihood(likelihood: Likelihood): string {
  switch (likelihood.explicit) {
    case true:
      return 'explicit'

    case false:
      return `implicit[${likelihood.level}]`
  }
}

function compareLikelihoods(
  this: MatcherUtils & Readonly<MatcherState>,
  actual: unknown,
  other: unknown,
  compare: (actual: Likelihood, other: Likelihood) => boolean,
  comparisonDescription: string,
  inverseComparisonDescription: string,
) {
  checkLikelihood(actual)
  checkLikelihood(other)

  let actualLikelihood = actual as Likelihood
  let otherLikelihood = other as Likelihood

  if (compare(actualLikelihood, otherLikelihood)) {
    return {
      message: () =>
        `expected ${printLikelihood(actualLikelihood)} to be ${inverseComparisonDescription} ${printLikelihood(otherLikelihood)}`,
      pass: true,
    }
  } else {
    return {
      message: () =>
        `expected ${printLikelihood(actualLikelihood)} to be ${comparisonDescription} ${printLikelihood(otherLikelihood)}`,
      pass: false,
    }
  }
}

const toBeLessLikelyThan: MatcherFunction<[other: Likelihood]> = function (actual: unknown, other: unknown) {
  return compareLikelihoods.bind(this)(
    actual,
    other,
    (actual, other) => {
      let pass: boolean
      if (!actual.explicit && !other.explicit) {
        pass = actual.level < other.level
      } else {
        pass = !actual.explicit
      }
      return pass
    },
    'less likely than',
    'more or as likely as',
  )
}

const toBeMoreLikelyThan: MatcherFunction<[other: Likelihood]> = function (actual: unknown, other: unknown) {
  return compareLikelihoods.bind(this)(
    actual,
    other,
    (actual, other) => {
      let pass: boolean
      if (!actual.explicit && !other.explicit) {
        pass = actual.level > other.level
      } else {
        pass = actual.explicit
      }
      return pass
    },
    'more likely than',
    'less or as likely as',
  )
}

const toBeAsLikelyAs: MatcherFunction<[other: Likelihood]> = function (actual: unknown, other: unknown) {
  return compareLikelihoods.bind(this)(
    actual,
    other,
    (actual, other) => {
      let pass: boolean
      if (!actual.explicit && !other.explicit) {
        pass = actual.level == other.level
      } else {
        pass = actual.explicit === other.explicit
      }
      return pass
    },
    'as likely as',
    'more or less likely than',
  )
}

expect.extend({
  toBeLessLikelyThan,
  toBeMoreLikelyThan,
  toBeAsLikelyAs,
})

declare module 'expect' {
  interface AsymmetricMatchers {
    toBeLessLikelyThan(other: Likelihood): void
    toBeMoreLikelyThan(other: Likelihood): void
    toBeAsLikelyAs(other: Likelihood): void
  }
  interface Matchers<R> {
    toBeLessLikelyThan(other: Likelihood): R
    toBeMoreLikelyThan(other: Likelihood): R
    toBeAsLikelyAs(other: Likelihood): R
  }
}
