export interface Config {
  badResponseHandler: BadResponseHandler
}

export interface BadResponseHandler {
  onBadResponse(response: Response): Response
}
