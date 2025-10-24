export interface OnBeforePacking {
  onBeforePacking(): void
}

export interface OnBeforeRequest {
  onBeforeRequest(): void
}

export interface OnBadResponse {
  onBadResponse(response: Response): Response | Promise<Response>
}

export interface OnFailedRequest {
  onFailedRequest(error: unknown): Response | Promise<Response>
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
