import { pack, unpack } from './map'
import { array, number, object, plainText, string } from '@module'

test('mapping an optional plain text value', async () => {
  const desc = plainText.optional

  const text =
    'It only had a few relatively small mountains, but there were still plenty ' +
    'of things built there, such as an observatory and a dam.'

  expect(desc.validate(undefined).isValid).toBeTrue()
  expect(desc.validate(text).isValid).toBeTrue()

  expect(pack(undefined, desc)).toBeUndefined()
  expect(pack(text, desc)).toEqual(text)

  await expect(unpack(new Response(null), desc)).resolves.toEqual('')
  await expect(unpack(new Response(text), desc)).resolves.toEqual(text)
})

test('mapping an optional JSON primitive', async () => {
  const desc = number.optional

  expect(desc.validate(undefined).isValid).toBeTrue()
  expect(desc.validate(3).isValid).toBeTrue()

  expect(pack(undefined, desc)).toBeNull()
  expect(pack(3, desc)).toEqual('3')

  await expect(unpack(new Response(null), desc)).resolves.toBeUndefined()
  await expect(unpack(new Response('3'), desc)).resolves.toEqual(3)
})

test('mapping an optional JSON array', async () => {
  const desc = array(string).optional

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

  expect(desc.validate(undefined).isValid).toBeTrue()
  expect(desc.validate(words).isValid).toBeTrue()

  expect(pack(undefined, desc)).toBeNull()
  expect(pack(words, desc)).toEqual(JSON.stringify(words))

  await expect(unpack(new Response(null), desc)).resolves.toBeUndefined()
  await expect(unpack(Response.json(words), desc)).resolves.toEqual(words)
})

test('mapping an optional JSON object', async () => {
  const desc = object({ sentence: string }).optional

  const sentence = 'The oldest modern esper could be woken using internal stimulation to her mind.'

  expect(desc.validate(undefined).isValid).toBeTrue()
  expect(desc.validate({ sentence }).isValid).toBeTrue()

  expect(pack(undefined, desc)).toBeNull()
  expect(pack({ sentence }, desc)).toEqual(JSON.stringify({ sentence }))

  await expect(unpack(new Response(null), desc)).resolves.toBeUndefined()
  await expect(unpack(Response.json({ sentence }), desc)).resolves.toStrictEqual({ sentence })
})
