import type { HooksConfig } from './hooks'
import type { HttpClient } from '@module/http'


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
