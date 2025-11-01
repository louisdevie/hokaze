import { UrlTemplate } from '@module/url'

test('a resource URL is the base followed by the name of the resource', () => {
  const template = new UrlTemplate('https://my.api.com/v1/')

  expect(template.getUrlForResource('fruits', {})).toEqual(new URL('https://my.api.com/v1/fruits'))
})

test('a template can be created from either a string or a URL object', () => {
  const templateFromString = new UrlTemplate('https://my.api.com/v1/')
  const templateFromURL = new UrlTemplate(new URL('https://my.api.com/v1/'))

  expect(templateFromString).toEqual(templateFromURL)
})

test('path separators are added and/or removed to normalize resource URLs', () => {
  const withSeparator = new UrlTemplate('https://my.api.com/v1/')
  const withoutSeparator = new UrlTemplate('https://my.api.com/v1')

  const sameExpectedResult = new URL('https://my.api.com/v1/fruits')

  expect(withSeparator.getUrlForResource('fruits', {})).toEqual(sameExpectedResult)
  expect(withSeparator.getUrlForResource('fruits/', {})).toEqual(sameExpectedResult)

  expect(withoutSeparator.getUrlForResource('fruits', {})).toEqual(sameExpectedResult)
  expect(withoutSeparator.getUrlForResource('fruits/', {})).toEqual(sameExpectedResult)
})

test('query parameters can be added to resource and item URLs', () => {
  const template = new UrlTemplate('https://my.api.com/v1/')

  const args = {
    text: 'hello',
    number: 34,
    enable: true,
    noValue: null,
    notIncluded: undefined,
    'kebab-case-param': 'a: b',
  }

  const resourceUrl = template.getUrlForResource('fruits', args)
  const itemUrl = template.getUrlForItem('fruits', 2, args)

  expect(resourceUrl.origin).toEqual('https://my.api.com')
  expect(itemUrl.origin).toEqual('https://my.api.com')

  expect(resourceUrl.pathname).toEqual('/v1/fruits')
  expect(itemUrl.pathname).toEqual('/v1/fruits/2')

  // test if percent encoding is used
  expect(resourceUrl.search).toContain('kebab-case-param=a%3A+b')
  expect(itemUrl.search).toContain('kebab-case-param=a%3A+b')

  const expectedSearchParams = [
    ['text', 'hello'],
    ['number', '34'],
    ['enable', 'true'],
    ['noValue', 'null'],
    ['kebab-case-param', 'a: b'],
  ]
  expect(Array.from(resourceUrl.searchParams)).toIncludeSameMembers(expectedSearchParams)
  expect(Array.from(itemUrl.searchParams)).toIncludeSameMembers(expectedSearchParams)
})

test('an item URL is the base followed by the name of the resource and the key', () => {
  const template = new UrlTemplate('https://my.api.com/v1/')

  expect(template.getUrlForItem('fruits', 2, {})).toEqual(new URL('https://my.api.com/v1/fruits/2'))
})
