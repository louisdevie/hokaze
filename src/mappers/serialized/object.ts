import {ValueMapper} from "@module/mappers/serialized/index";
import {ResponseBody} from "@module/backend";
import {Key} from "@module/resources";

export interface ObjectMapper<T> extends ValueMapper<T> {
  setKeyProperty(value: string): void

  tryToUnpackKey(responseBody: ResponseBody): Promise<Key | undefined>;
}