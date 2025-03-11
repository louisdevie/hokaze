export interface Config {
  badResponseHandler: BadResponseHandler
  failedRequestHandler: FailedRequestHandler
}

export interface BadResponseHandler {
  onBadResponse(response: Response): Response | Promise<Response>
}

export interface FailedRequestHandler {
  onFailedRequest(error: unknown): Response | Promise<Response>
}
