import type { AuthScheme } from '.'

export class BearerToken implements AuthScheme {
  private readonly _token: string

  public constructor(token: string) {
    this._token = token
  }

  public setupHeaders(headers: Headers): void {
    headers.append('Authorization', 'Bearer ' + this._token)
  }
}
