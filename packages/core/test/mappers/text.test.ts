import { responseData } from '.'
import { BindingTarget } from '~/mappers'
import { TextMapper } from '~/mappers/text'

describe(TextMapper, () => {
  test('mapping a string value', async () => {
    const mapper = new TextMapper()

    const text =
      'It only had a few relatively small mountains, but there were still plenty ' +
      'of things built there, such as an observatory and a dam.'

    expect(mapper.pack(text)).toEqual({
      bindTo: [BindingTarget.RequestBody],
      mediaType: 'text/plain;charset=utf-8',
      value: text,
    })

    await expect(mapper.unpack(responseData(text))).resolves.toEqual(text)
  })

  test('mapping a missing value', async () => {
    const mapper = new TextMapper()

    expect(mapper.pack(undefined)).toEqual({
      bindTo: [BindingTarget.RequestBody],
      value: null,
    })
    expect(mapper.pack(null)).toEqual({
      bindTo: [BindingTarget.RequestBody],
      value: null,
    })

    await expect(mapper.unpack(responseData())).resolves.toEqual('')
  })

  test('mapping a non-string value', async () => {
    const mapper = new TextMapper()

    expect(mapper.pack(3)).toEqual({
      bindTo: [BindingTarget.RequestBody],
      mediaType: 'text/plain;charset=utf-8',
      value: '3',
    })
    expect(mapper.pack(false)).toEqual({
      bindTo: [BindingTarget.RequestBody],
      mediaType: 'text/plain;charset=utf-8',
      value: 'false',
    })
    expect(mapper.pack({ property: false })).toEqual({
      bindTo: [BindingTarget.RequestBody],
      mediaType: 'text/plain;charset=utf-8',
      value: '[object Object]',
    })
  })
})
