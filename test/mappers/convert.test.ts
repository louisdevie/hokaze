import { number, object, string } from '@module'

describe('convert to another value of the same type', () => {
  function uppercase(value: string) {
    return value.toUpperCase()
  }
  function lowercase(value: string) {
    return value.toLowerCase()
  }

  test('only before serialisation', async () => {
    const mapper = string.converted({ pack: lowercase }).makeMapper()

    await expect(mapper.unpack(Response.json('Gekota'))).resolves.toEqual('Gekota')
    expect(mapper.pack('Gekota').intoBodyInit()).toEqual(JSON.stringify('gekota'))
  })

  test('only after deserialisation', async () => {
    const mapper = string.converted({ unpack: uppercase }).makeMapper()

    await expect(mapper.unpack(Response.json('Gekota'))).resolves.toEqual('GEKOTA')
    expect(mapper.pack('Gekota').intoBodyInit()).toEqual(JSON.stringify('Gekota'))
  })

  test('before serialisation and after deserialisation', async () => {
    const mapper = string.converted({ unpack: uppercase, pack: lowercase }).makeMapper()

    await expect(mapper.unpack(Response.json('Gekota'))).resolves.toEqual('GEKOTA')
    expect(mapper.pack('Gekota').intoBodyInit()).toEqual(JSON.stringify('gekota'))
  })
})

test('convert to another value of a different type', async () => {
  // two ways of keeping the number type
  const mapperA = string.converted<number>({ unpack: Number, pack: String }).makeMapper()
  const mapperB = string.converted({ unpack: Number, pack: (n: number) => String(n) }).makeMapper()

  await expect(mapperA.unpack(Response.json('45'))).resolves.toEqual(45)
  expect(mapperA.pack(67).intoBodyInit()).toEqual(JSON.stringify('67'))
})

test("accept any type as long as the 'out' operation can convert it", async () => {
  const mapper = string.converted({ pack: String }).makeMapper()

  // anything cant be sent through the String constructor
  expect(mapper.pack('Pyonko').intoBodyInit()).toEqual(JSON.stringify('Pyonko'))
  expect(mapper.pack(900).intoBodyInit()).toEqual(JSON.stringify('900'))
  expect(mapper.pack([1, 2, 3]).intoBodyInit()).toEqual(JSON.stringify('1,2,3'))
})

describe('converting a value by wrapping it in a class', () => {
  test("when the class is unrelated to the value's type", async () => {
    class Counter {
      public constructor(private value: number) {}

      public increment(): void {
        this.value++
      }

      public valueOf(): number {
        return this.value
      }
    }

    const mapper = number.convertedInto(Counter).makeMapper()

    await expect(mapper.unpack(Response.json(45))).resolves.toStrictEqual(new Counter(45))
    expect(mapper.pack(new Counter(67)).intoBodyInit()).toEqual(JSON.stringify(67))
  })

  test('when the class can be constructed from a string', async () => {
    const mapper = string.convertedInto(URL).makeMapper()

    const urlResult = mapper.unpack(Response.json('https://example.com'))
    await expect(urlResult).resolves.toStrictEqual(new URL('https://example.com'))

    const url = await urlResult
    url.pathname = 'search'
    url.searchParams.set('q', 'foo bar baz')
    expect(mapper.pack(url).intoBodyInit()).toEqual(JSON.stringify('https://example.com/search?q=foo+bar+baz'))
  })

  test('the valueOf method is always preferred over the toString method', async () => {
    class Wrapper {
      public constructor(private value: string) {}

      public valueOf(): string {
        return `valueOf: ${this.value}`
      }

      public toString(): string {
        return `toString: ${this.value}`
      }
    }

    const mapper = string.convertedInto(Wrapper).makeMapper()

    await expect(mapper.unpack(Response.json('wrapped'))).resolves.toStrictEqual(new Wrapper('wrapped'))
    expect(mapper.pack(new Wrapper('wrapped')).intoBodyInit()).toEqual(JSON.stringify('valueOf: wrapped'))
  })

  test('when the class extends the DTO', async () => {
    class A {
      public a: number
      // we can have additional properties, as long as they are not required in the constructor
      public b?: string

      public constructor(init: { a: number; b?: string }) {
        this.a = init.a
        this.b = init.b
      }
    }

    const mapper = object({ a: number }).asInstanceOf(A).makeMapper()

    await expect(mapper.unpack(Response.json({ a: 3 }))).resolves.toStrictEqual(new A({ a: 3 }))
    expect(mapper.pack(new A({ a: 8, b: 'eight' })).intoBodyInit()).toEqual(JSON.stringify({ a: 8 }))
  })
})
/*

class ExampleWithConstructor {
  private _foo: string
  private _bar: number
  private _baz?: boolean

  public constructor(init: { foo?: string; bar: number; baz?: boolean }) {
    this._foo = init.foo ?? 'FOO'
    this._bar = init.bar
    this._baz = init.baz
  }
}

class ExampleWithoutConstructor {
  public foo: string = 'FOO'
  public bar!: number
  public baz?: boolean
}

test('serialising a class instance', () => {
  const usingCtor = object({foo: string.optional, bar: number, baz: boolean.optional}).mappedTo(ExampleWithConstructor)
})

 */
