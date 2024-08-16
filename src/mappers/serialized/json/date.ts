import {ValueMapper} from "@module/mappers/serialized";

export class JsonIsoDateMapper<N> extends ValueMapper<Date | N> {
  public packValue(value: Date): unknown {
    return value
  }

  public unpackValue(response: unknown): Date {
    return new Date(String(response))
  }

  public get expectedResponseType(): string {
    return "application/json";
  }
}
