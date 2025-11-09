import { AnyData, AnyDataOptions } from './base'
import { Mapper } from '~/mappers'
import { BlobMapper } from '~/mappers/blob'

/**
 * Describes a Blob value.
 * @template N Additional values the field can hold.
 */
export class BlobData<N> extends AnyData<Blob | N, BlobData<N>> {
  public constructor(copyFrom?: BlobData<N>, options?: AnyDataOptions<N>) {
    super(copyFrom, options)
  }

  protected createDefaultBlankValue(): Blob | N {
    return new Blob()
  }

  protected cloneAsSelf(options: AnyDataOptions<N>): BlobData<N> {
    return new BlobData<N>(this, options)
  }

  public createMapper(): Mapper<Blob | N> {
    return new BlobMapper()
  }

  public override get optional(): BlobData<N | undefined> {
    return new BlobData<N | undefined>(this, { isOptional: true })
  }
}

/**
 * Describes a Blob value.
 */
export const blob: BlobData<never> = new BlobData<never>()
