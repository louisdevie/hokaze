import type { AuthScheme } from '.'

export class BasicAuth implements AuthScheme {
  private readonly _credentials: string

  public constructor(username: string, password: string) {
    this._credentials = btoa(username + ':' + password)
  }

  public setupHeaders(headers: Headers): void {
    headers.append('Authorization', 'Basic ' + this._credentials)
  }
}
