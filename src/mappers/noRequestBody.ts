import { RequestBodyOrParams } from '../http'

/** @internal */
export class NoRequestBody implements RequestBodyOrParams {
  public intoBodyInit(): null {
    return null
  }

  public readonly type = null
}
