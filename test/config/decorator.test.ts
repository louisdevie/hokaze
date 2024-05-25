import { Config } from '@module/config'
import { DecoratorConfig } from '@module/config/decorator'
import { defaultConfig } from '@module/config/default'

const baseConfig: Config = {
  objectSerializationInURL: 'throw',
}

test('overriding objectSerializationInURL', () => {
  const noOverride = new DecoratorConfig(baseConfig, {})
  expect(noOverride.objectSerializationInURL).toEqual(baseConfig.objectSerializationInURL)

  const override = new DecoratorConfig(baseConfig, { objectSerializationInURL: 'json' })
  expect(override.objectSerializationInURL).toEqual('json')

  const reset = new DecoratorConfig(baseConfig, { objectSerializationInURL: 'reset' })
  expect(reset.objectSerializationInURL).toEqual(defaultConfig.objectSerializationInURL)
})
