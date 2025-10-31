import type { Interceptor } from '.'
import { throwError } from '@module/errors'
import { HttpHandler, HttpRequest, HttpResponse } from '@module/http'
import L from '@module/locale'

/**
 * @internal
 */
class AuthenticationScheme implements Interceptor {
  private readonly _authorization: string

  public constructor(scheme: string, credentials: string) {
    this._authorization = scheme + ' ' + credentials
  }

  public intercept(request: HttpRequest, next: HttpHandler): Promise<HttpResponse> {
    request.headers.set('Authorization', this._authorization)
    return next.handle(request)
  }
}

export function basicAuth(username: string, password: string, useUTF8: boolean = true): Interceptor {
  if (username.includes(':')) {
    throwError(L.colonNotAllowedInUsername)
  }
  const credentials = username + ':' + password

  let encodedCredentials
  if (useUTF8) {
    encodedCredentials = new TextEncoder()
      .encode(credentials)
      .reduce((byteString, byte) => byteString + String.fromCodePoint(byte), '')
  } else {
    encodedCredentials = credentials
  }
  return new AuthenticationScheme('Basic', btoa(encodedCredentials))
}

export function bearerToken(token: string): Interceptor {
  return new AuthenticationScheme('Bearer', token)
}
