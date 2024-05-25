import { defaultConfig } from '@module/config/default'

test('defaultConfig was not modified', () => {
  // have a copy of the default values here, so they don't get changed by accident
  expect(defaultConfig).toStrictEqual({
    objectSerializationInURL: 'placeholder',
  })
})
