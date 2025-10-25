import {
  Hooks,
  OnAfterResponse,
  OnAfterUnpacking,
  OnBadResponse,
  OnBeforePacking,
  OnBeforeRequest,
  OnFailedRequest,
} from '@module/hooks'
import { BadResponse, HttpResponse } from '@module/http'

export type HooksConfig = Hooks

export const DefaultHooksConfig = {
  onBeforePacking(): void {},
  onBeforeRequest(): void {},
  onBadResponse(response: HttpResponse): never {
    throw new BadResponse(response)
  },
  onFailedRequest(error: unknown): never {
    throw error
  },
  onAfterResponse(): void {},
  onAfterUnpacking(): void {},
}

export type PartialHooksConfig = Partial<HooksConfig>

export function mergeHooksConfig(base: HooksConfig, override: PartialHooksConfig | undefined): HooksConfig {
  return {
    onBeforePacking: override?.onBeforePacking ?? base.onBeforePacking,
    onBeforeRequest: override?.onBeforeRequest ?? base.onBeforeRequest,
    onBadResponse: override?.onBadResponse ?? base.onBadResponse,
    onFailedRequest: override?.onFailedRequest ?? base.onFailedRequest,
    onAfterResponse: override?.onAfterResponse ?? base.onAfterResponse,
    onAfterUnpacking: override?.onAfterUnpacking ?? base.onAfterUnpacking,
  }
}
