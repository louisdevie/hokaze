import { ValueMapper } from "@module/mappers/serialized";

export class JsonStringMapper<N> extends ValueMapper<string | N> {
  public packValue(value: string): unknown {
    return value
  }

  public unpackValue(response: unknown): string {
    return String(response)
  }

  public get expectedResponseType(): string {
    return "application/json";
  }
}
