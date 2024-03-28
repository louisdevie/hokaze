import { UrlTemplate } from '@module/url'

test('a resource URL is the base followed by the name of the resource', () => {
  const template = new UrlTemplate('https://my.api.com/v1/', {})

  expect(template.getUrlForResource('fruits', {})).toEqual(new URL('https://my.api.com/v1/fruits'))
})

test('path separators are added and/or removed to normalize resource URLs', () => {
  const withSeparator = new UrlTemplate('https://my.api.com/v1/', {})
  const withoutSeparator = new UrlTemplate('https://my.api.com/v1', {})

  const sameExpectedResult = new URL('https://my.api.com/v1/fruits')

  expect(withSeparator.getUrlForResource('fruits', {})).toEqual(sameExpectedResult)
  expect(withSeparator.getUrlForResource('fruits/', {})).toEqual(sameExpectedResult)

  expect(withoutSeparator.getUrlForResource('fruits', {})).toEqual(sameExpectedResult)
  expect(withoutSeparator.getUrlForResource('fruits/', {})).toEqual(sameExpectedResult)
})

test('query parameters can be added to a resource URL', () => {
  const template = new UrlTemplate('https://my.api.com/v1/', {})

  const url = template.getUrlForResource('fruits', {
    text: 'hello',
    number: 34,
    enable: true,
    noValue: null,
    notIncluded: undefined,
    'kebab-case-param': 'a: b',
  })

  expect(url.origin).toEqual('https://my.api.com')
  expect(url.pathname).toEqual('/v1/fruits')
  expect(url.search).toContain('kebab-case-param=a%3A+b') // test if percent encoding is used
  expect(Array.from(url.searchParams)).toEqual([
    ['text', 'hello'],
    ['number', '34'],
    ['enable', 'true'],
    ['noValue', 'null'],
    ['kebab-case-param', 'a: b'],
  ])
})
