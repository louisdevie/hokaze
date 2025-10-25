import { HttpResponse } from '@module/http'

export interface OnBeforePacking {
  onBeforePacking(): void
}

export interface OnBeforeRequest {
  onBeforeRequest(): void
}

export interface OnBadResponse {
  onBadResponse(response: HttpResponse): HttpResponse | Promise<HttpResponse>
}

export interface OnFailedRequest {
  onFailedRequest(error: unknown): HttpResponse | Promise<HttpResponse>
}

export interface OnAfterResponse {
  onAfterResponse(): void
}

export interface OnAfterUnpacking {
  onAfterUnpacking(): void
}

export interface Hooks
  extends OnBeforePacking,
    OnBeforeRequest,
    OnBadResponse,
    OnFailedRequest,
    OnAfterResponse,
    OnAfterUnpacking {}
