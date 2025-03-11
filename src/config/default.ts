import type { Config, BadResponseHandler, FailedRequestHandler } from '.'
import { BadResponse } from '@module/backend/fetch'

const defaultErrorHandler: BadResponseHandler & FailedRequestHandler = {
  onBadResponse(response: Response): never {
    throw new BadResponse(response)
  },
  onFailedRequest(error: unknown): never {
    throw error
  },
}

export const defaultConfig: Config = {
  badResponseHandler: defaultErrorHandler,
  failedRequestHandler: defaultErrorHandler,
}
