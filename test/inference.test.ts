import { Infer, Likelihood } from '@module/inference'

test('explicit is always more likely than implicit', () => {
  const explicit = Likelihood.explicit()
  const highlyImplicit = Likelihood.implicit(10)
  const implicit = Likelihood.implicit(5)
  const hardlyImplicit = Likelihood.implicit(1)
  const notAtAll = Likelihood.implicit(0)

  expect(explicit.isMoreLikelyThan(highlyImplicit)).toBeTrue()
  expect(explicit.isMoreLikelyThan(implicit)).toBeTrue()
  expect(explicit.isMoreLikelyThan(hardlyImplicit)).toBeTrue()
  expect(explicit.isMoreLikelyThan(notAtAll)).toBeTrue()
})

test('implicit with higher level values are more likely', () => {
  const highlyImplicit = Likelihood.implicit(10)
  const implicit = Likelihood.implicit(5)
  const hardlyImplicit = Likelihood.implicit(1)
  const notAtAll = Likelihood.implicit(0)

  expect(highlyImplicit.isMoreLikelyThan(implicit)).toBeTrue()
  expect(implicit.isMoreLikelyThan(hardlyImplicit)).toBeTrue()
  expect(hardlyImplicit.isMoreLikelyThan(notAtAll)).toBeTrue()
})

test('the isMoreLikelyThan method is a strict total order', () => {
  const explicit = Likelihood.explicit()
  const implicit = Likelihood.implicit(7)
  const notAtAll = Likelihood.implicit(0)

  // reflexivity: a <= a
  expect(explicit.isMoreLikelyThan(explicit)).toBeFalse()
  expect(implicit.isMoreLikelyThan(implicit)).toBeFalse()
  expect(notAtAll.isMoreLikelyThan(notAtAll)).toBeFalse()

  // transitivity: if a <= b
  expect(notAtAll.isMoreLikelyThan(implicit)).toBeFalse()
  // and b <= c
  expect(implicit.isMoreLikelyThan(explicit)).toBeFalse()
  // then a <= c
  expect(notAtAll.isMoreLikelyThan(explicit)).toBeFalse()

  // totality: either a <= b or b <= a
  expect(explicit.isMoreLikelyThan(implicit)).toBeTrue()
  expect(implicit.isMoreLikelyThan(explicit)).toBeFalse()
})

test('the isLessLikelyThan method is a strict total order', () => {
  const explicit = Likelihood.explicit()
  const implicit = Likelihood.implicit(7)
  const notAtAll = Likelihood.implicit(0)

  // reflexivity: a <= a
  expect(explicit.isLessLikelyThan(explicit)).toBeFalse()
  expect(implicit.isLessLikelyThan(implicit)).toBeFalse()
  expect(notAtAll.isLessLikelyThan(notAtAll)).toBeFalse()

  // transitivity: if a <= b
  expect(implicit.isLessLikelyThan(notAtAll)).toBeFalse()
  // and b <= c
  expect(explicit.isLessLikelyThan(implicit)).toBeFalse()
  // then a <= c
  expect(explicit.isLessLikelyThan(notAtAll)).toBeFalse()

  // totality: either a <= b or b <= a
  expect(implicit.isLessLikelyThan(explicit)).toBeTrue()
  expect(explicit.isLessLikelyThan(implicit)).toBeFalse()
})

test('the isAsLikelyAs is an equality relation', () => {
  const explicit = Likelihood.explicit()
  const implicit = Likelihood.implicit(7)
  const notAtAll = Likelihood.implicit(0)

  // if two likelihoods are created the same way, they should be equal
  expect(explicit.isAsLikelyAs(Likelihood.explicit())).toBeTrue()
  expect(implicit.isAsLikelyAs(Likelihood.implicit(7))).toBeTrue()
  expect(notAtAll.isAsLikelyAs(Likelihood.implicit(0))).toBeTrue()

  // otherwise, they should not be equal
  expect(explicit.isAsLikelyAs(Likelihood.implicit(3))).toBeFalse()
  expect(implicit.isAsLikelyAs(Likelihood.implicit(6))).toBeFalse()
  expect(notAtAll.isAsLikelyAs(Likelihood.explicit())).toBeFalse()

  // transitivity: if a = b and b = c then a = c
  const implicitA = Likelihood.implicit(7)
  const implicitB = Likelihood.implicit(7)
  expect(implicit.isAsLikelyAs(implicitA)).toBeTrue()
  expect(implicitA.isAsLikelyAs(implicitB)).toBeTrue()
  expect(implicit.isAsLikelyAs(implicitB)).toBeTrue()
  // and if a = b and b != c then a != c
  const implicitC = Likelihood.implicit(4)
  expect(implicit.isAsLikelyAs(implicitC)).toBeFalse()
  expect(implicitA.isAsLikelyAs(implicitC)).toBeFalse()
  expect(implicitB.isAsLikelyAs(implicitC)).toBeFalse()

  // if a = b then a <= b and b <= a
  expect(implicit.isLessLikelyThan(implicitA)).toBeFalse()
  expect(implicit.isMoreLikelyThan(implicitA)).toBeFalse()
})

test('relative ID field likelihood is correct', () => {
  let resourceNamePlusId = Infer.isImplicitId({ fieldName: 'somethingId', resourceName: 'something' })
  let idPlusResourceName = Infer.isImplicitId({ fieldName: 'idSomething', resourceName: 'something' })
  let resourceNameUnderscoreId = Infer.isImplicitId({ fieldName: 'something_id', resourceName: 'something' })
  let justId = Infer.isImplicitId({ fieldName: 'id', resourceName: 'something' })
  let random = Infer.isImplicitId({ fieldName: 'random', resourceName: 'something' })

  expect(resourceNamePlusId.isAsLikelyAs(idPlusResourceName)).toBeTrue()
  expect(resourceNamePlusId.isMoreLikelyThan(resourceNameUnderscoreId)).toBeTrue()
  expect(resourceNameUnderscoreId.isMoreLikelyThan(justId)).toBeTrue()
  expect(justId.isMoreLikelyThan(random)).toBeTrue()
})

test('ID field inference is insensitive to case and punctuation', () => {
  let same = [
    ['something1Id', 'Something1ID'],
    ['random', '__random__'],
    ['something-1-id', 'something1.id'],
  ]

  for (const [first, second] of same) {
    let firstResult = Infer.isImplicitId({ fieldName: first, resourceName: 'something1' })
    let secondResult = Infer.isImplicitId({ fieldName: second, resourceName: 'something1' })

    expect(firstResult.isAsLikelyAs(secondResult)).toBeTrue()
  }
})
