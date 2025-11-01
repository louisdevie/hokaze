import { CustomRequestInit, SpecificRequestType } from '../requests'
import { PartialConfig } from '@module/config'

type SegmentInit = CustomRequestInit<unknown, unknown>

export type SpecificSegmentType<Init extends SegmentInit> =
  Init extends CustomRequestInit<unknown, unknown> ? SpecificRequestType<Init> : never

export type WebServiceInit = Record<string, SegmentInit>

export type WebService<Init extends WebServiceInit> =
  { [P in keyof Init]: SpecificSegmentType<Init[P]> } extends infer WS ? WS : never

export interface WebServiceConfig extends PartialConfig {
  baseUrl: string | URL
}

export function createWebService<Init extends WebServiceInit>(
  config: string | URL | WebServiceConfig,
  init: Init,
): WebService<Init> {}
