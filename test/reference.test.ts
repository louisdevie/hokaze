import { Ref } from '@module/reference'
import { fakeResource } from '@fake'

test('a Ref created from a key is unloaded and has the corresponding key', () => {
  const res = fakeResource()

  const ref = Ref.fromKey(res, 2)

  expect(ref.value).toBeUndefined()
  expect(ref.key).toEqual(2)
})

test('a Ref created from a value is loaded and has the corresponding key', () => {
  const res = fakeResource()

  const ref = Ref.fromValue(res, { id: 2, name: 'Pear' })

  expect(ref.value).toEqual({ id: 2, name: 'Pear' })
  expect(ref.key).toEqual(2)
})

test('using get on a Ref fetches the value if necessary', () => {
  const res = fakeResource()
  const get = jest.spyOn(res, 'get')

  const refFromValue = Ref.fromValue(res, { id: 2, name: 'Pear' })
  expect(refFromValue.get()).resolves.toEqual({ id: 2, name: 'Pear' })
  expect(get).not.toHaveBeenCalled()

  const refFromKey = Ref.fromKey(res, 2)
  expect(refFromKey.get()).resolves.toEqual({ id: 2, name: 'Pear' })
  expect(get).toHaveBeenCalledWith(2)
})

test('using set on a Ref changes the key invalidates the value', () => {
  const res = fakeResource()

  const ref = Ref.fromValue(res, { id: 2, name: 'Pear' })

  ref.set(3)
  expect(ref.value).toBeUndefined()
  expect(ref.key).toEqual(3)
})

test('using change on a Ref changes the key and fetches the new value', async () => {
  const res = fakeResource()
  const get = jest.spyOn(res, 'get')

  const ref = Ref.fromValue(res, { id: 2, name: 'Pear' })

  await ref.change(3)
  expect(ref.value).toEqual({ id: 3, name: 'Apricot' })
  expect(ref.key).toEqual(3)
  expect(get).toHaveBeenCalledWith(3)
})

test('setting the key on a Ref does not fetch anything if it is the same', async () => {
  const res = fakeResource()
  const get = jest.spyOn(res, 'get')

  const ref = Ref.fromValue(res, { id: 2, name: 'Pear' })

  await ref.change(2)
  expect(get).not.toHaveBeenCalled()

  ref.set(2)
  await ref.get()
  expect(get).not.toHaveBeenCalled()
})
