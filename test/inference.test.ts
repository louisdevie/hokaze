import { expect, test } from '@jest/globals'
import { Infer } from '@module/inference'
import './_matchers/likelihood'

test('ID field inference levels', () => {
  let resourceNamePlusId = Infer.isImplicitId({ fieldName: 'somethingId', resourceName: 'something' })
  let justId = Infer.isImplicitId({ fieldName: 'id', resourceName: 'something' })
  let containsId = Infer.isImplicitId({ fieldName: 'somethingElseId', resourceName: 'something' })
  let random = Infer.isImplicitId({ fieldName: 'random', resourceName: 'something' })

  // check that [resource name + "id"] > "id" > [something containing "id"] > [anything]

  expect(resourceNamePlusId).toBeMoreLikelyThan(justId)
  expect(justId).toBeMoreLikelyThan(containsId)
  expect(containsId).toBeMoreLikelyThan(random)
})

test('ID field inference is insensitive to case and punctuation', () => {
  let same = [
    ['somethingId', 'SomethingId'],
    ['id', 'ID'],
    ['random', '_random'],
    ['something-else-id', 'something.else.id'],
  ]

  for (const [first, second] of same) {
    let firstResult = Infer.isImplicitId({ fieldName: first, resourceName: 'something' })
    let secondResult = Infer.isImplicitId({ fieldName: second, resourceName: 'something' })

    expect(firstResult).toBeAsLikelyAs(secondResult)
  }
})
