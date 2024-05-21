import type { RequestPath } from '@module/requestPath'
import __ from '@module/locale'
import { throwError } from '@module/errors'

export class InvalidRequestPath implements RequestPath {
  private readonly _errorMessage: string

  public constructor(errorMessage?: string) {
    this._errorMessage = errorMessage ?? __.invalidRequestPathDefault
  }

  public collection(): never {
    throwError(this._errorMessage)
  }

  public single(): never {
    throwError(this._errorMessage)
  }

  public getRequest(): never {
    throwError(this._errorMessage)
  }

  public postRequest(): never {
    throwError(this._errorMessage)
  }

  public putRequest(): never {
    throwError(this._errorMessage)
  }

  public deleteRequest(): never {
    throwError(this._errorMessage)
  }
}
