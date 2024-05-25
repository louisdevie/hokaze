import { getGlobalConfig, globalConfig } from '@module/config/global'
import { defaultConfig } from '@module/config/default'

test('setting the config', () => {
  const cfgBefore = getGlobalConfig()

  expect(cfgBefore.objectSerializationInURL).toEqual(defaultConfig.objectSerializationInURL)

  globalConfig({ objectSerializationInURL: 'json' })

  const cfgAfter = getGlobalConfig()
  expect(cfgBefore.objectSerializationInURL).toEqual('json')
  expect(cfgAfter.objectSerializationInURL).toEqual('json')
})
