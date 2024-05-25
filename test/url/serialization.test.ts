import { UrlSerializationImpl } from '@module/url/serialization'
import __ from '@module/locale'

class TheClass {
  private readonly _thePrivateAttr: string

  public constructor(theArg: string) {
    this._thePrivateAttr = theArg
  }

  public get theProperty(): string {
    return this._thePrivateAttr
  }

  public theMethod(theArg: number): string {
    return this._thePrivateAttr.substring(theArg)
  }
}

test('"throw" mode always throw an error', () => {
  expect(() => UrlSerializationImpl.throw({})).toThrow(__.objectInUrlNotAllowed)
  expect(() => UrlSerializationImpl.throw({ a: 5, b: 6 })).toThrow(__.objectInUrlNotAllowed)
  expect(() => UrlSerializationImpl.throw([7, 8, 9])).toThrow(__.objectInUrlNotAllowed)
  expect(() => UrlSerializationImpl.throw(new TheClass('ETANG'))).toThrow(__.objectInUrlNotAllowed)
})

test('"placeholder" mode always return the same string', () => {
  expect(UrlSerializationImpl.placeholder({})).toEqual('[object]')
  expect(UrlSerializationImpl.placeholder({ a: 5, b: 6 })).toEqual('[object]')
  expect(UrlSerializationImpl.placeholder([7, 8, 9])).toEqual('[object]')
  expect(UrlSerializationImpl.placeholder(new TheClass('ETANG'))).toEqual('[object]')
})

test('"json" mode returns the object as compact JSON', () => {
  expect(UrlSerializationImpl.json({})).toEqual('{}')
  expect(UrlSerializationImpl.json({ a: 5, b: 6 })).toEqual('{"a":5,"b":6}')
  expect(UrlSerializationImpl.json([7, 8, 9])).toEqual('[7,8,9]')
  expect(UrlSerializationImpl.json(new TheClass('ETANG'))).toEqual('{"_thePrivateAttr":"ETANG"}')
})

test('"json" mode returns the object as compact JSON encoded into UTF-8 and then Base64', () => {
  expect(UrlSerializationImpl['json+base64']({})).toEqual('e30=')
  expect(UrlSerializationImpl['json+base64']({ a: 5, b: 6 })).toEqual('eyJhIjo1LCJiIjo2fQ==')
  expect(UrlSerializationImpl['json+base64']([7, 8, 9])).toEqual('WzcsOCw5XQ==')
  expect(UrlSerializationImpl['json+base64'](new TheClass('ETANG'))).toEqual('eyJfdGhlUHJpdmF0ZUF0dHIiOiJFVEFORyJ9')
})
