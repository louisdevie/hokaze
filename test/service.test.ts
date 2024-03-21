import { RestServiceImpl } from '../src/service'
import { fakeHttpClient, fakeResourceUrl } from './_fake'
import { string } from '../src'

test('create a resource', () => {
  let service = new RestServiceImpl(fakeResourceUrl(), fakeHttpClient())

  service.resource({
    name: 'test',
    fields: ['a', 'b', 'c'],
  })

  let a = service.resource({
    name: 'test',
    fields: {
      a: string.withBlankValue('oui'),
    },
  })
})
