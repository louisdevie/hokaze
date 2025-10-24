import {
  OnAfterResponse,
  OnAfterUnpacking,
  OnBadResponse,
  OnBeforePacking,
  OnBeforeRequest,
  OnFailedRequest,
} from '@module/hooks'

export type SingleHookConfig =
  | OnBeforePacking
  | OnBeforeRequest
  | OnBadResponse
  | OnFailedRequest
  | OnAfterResponse
  | OnAfterUnpacking

export type HooksConfig = SingleHookConfig | SingleHookConfig[]
