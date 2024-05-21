import { RequestPath } from '@module/requestPath'

class FakeRequestPath implements RequestPath {
  public collection(): never {
    throw new Error('Method not implemented.')
  }

  public single(): never {
    throw new Error('Method not implemented.')
  }

  public getRequest(): never {
    throw new Error('Method not implemented.')
  }

  public postRequest(): never {
    throw new Error('Method not implemented.')
  }

  public putRequest(): never {
    throw new Error('Method not implemented.')
  }

  public deleteRequest(): never {
    throw new Error('Method not implemented.')
  }
}

export function fakeRequestPath(): RequestPath {
  return new FakeRequestPath()
}
