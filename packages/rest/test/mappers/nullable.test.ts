import { pack, unpack } from './map'
import { array, number, object, string } from '@module'

test('mapping a nullable JSON primitive', async () => {
  const desc = number.nullable

  expect(desc.validate(null).isValid).toBeTrue()
  expect(desc.validate(3).isValid).toBeTrue()

  expect(pack(null, desc)).toEqual('null')
  expect(pack(3, desc)).toEqual('3')

  await expect(unpack(new Response('null'), desc)).resolves.toBeNull()
  await expect(unpack(new Response('3'), desc)).resolves.toEqual(3)
})

test('mapping a nullable JSON array', async () => {
  const desc = array(string).nullable

  const words = [
    'be',
    'could',
    'esper',
    'her',
    'internal',
    'mind',
    'modern',
    'oldest',
    'stimulation',
    'the',
    'to',
    'using',
    'woken',
  ]

  expect(desc.validate(null).isValid).toBeTrue()
  expect(desc.validate(words).isValid).toBeTrue()

  expect(pack(null, desc)).toEqual('null')
  expect(pack(words, desc)).toEqual(JSON.stringify(words))

  await expect(unpack(new Response('null'), desc)).resolves.toBeNull()
  await expect(unpack(Response.json(words), desc)).resolves.toEqual(words)
})

test('mapping a nullable JSON object', async () => {
  const desc = object({ sentence: string }).nullable

  const sentence = 'The oldest modern esper could be woken using internal stimulation to her mind.'

  expect(desc.validate(null).isValid).toBeTrue()
  expect(desc.validate({ sentence }).isValid).toBeTrue()

  expect(pack(null, desc)).toEqual('null')
  expect(pack({ sentence }, desc)).toEqual(JSON.stringify({ sentence }))

  await expect(unpack(new Response('null'), desc)).resolves.toBeNull()
  await expect(unpack(Response.json({ sentence }), desc)).resolves.toStrictEqual({ sentence })
})
