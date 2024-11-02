import type { Config, BadResponseHandler } from '.'
import { BadResponse } from '@module/backend/fetch'

const defaultErrorHandler: BadResponseHandler = {
  onBadResponse(response: Response): Response {
    throw new BadResponse(response)
  },
}

export const defaultConfig: Config = {
  badResponseHandler: defaultErrorHandler,
}
