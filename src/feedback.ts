type AsyncReaction = () => Promise<void>

/**
 * Used to return a value from a function and let the caller send information back about that value.
 *
 * @note The value must be rejected or accepted before this object is disposed of.
 */
export class AsyncFeedback<T> {
  private readonly _value: T
  private readonly _onAccepted: AsyncReaction[]
  private readonly _onRejected: AsyncReaction[]
  private feedbackGiven: boolean

  /**
   * Wraps a value in a new {@link AsyncFeedback}.
   */
  public constructor(value: T) {
    this._value = value
    this._onAccepted = []
    this._onRejected = []
    this.feedbackGiven = false
  }

  /**
   * The wrapped value.
   */
  public get value(): T {
    return this._value
  }

  /**
   * Adds a reaction to the value being {@link accept}ed.
   * @param reaction The callback function.
   */
  public onAccepted(reaction: AsyncReaction): void {
    this._onAccepted.unshift(reaction)
  }

  /**
   * Adds a reaction to the value being {@link reject}ed.
   * @param reaction The callback function.
   */
  public onRejected(reaction: AsyncReaction): void {
    this._onRejected.unshift(reaction)
  }

  /**
   * Notifies that the value was valid. Once this function is called, you can not accept or reject the value again.
   */
  public async accept(): Promise<void> {
    if (this.feedbackGiven) {
      throw new Error('feedback given multiple times')
    }
    for (const reaction of this._onAccepted) {
      await reaction()
    }
    this.feedbackGiven = true
  }

  /**
   * Notifies that an error occurred because of the value. Once this function is called, you can not accept or reject
   * the value again.
   */
  public async reject(): Promise<void> {
    if (this.feedbackGiven) {
      throw new Error('feedback given multiple times')
    }
    for (const reaction of this._onRejected) {
      await reaction()
    }
    this.feedbackGiven = true
  }

  /**
   * Notifies that the value was valid if it has not been rejected yet. This method is useful when the value can be
   * rejected for multiple/complex reasons.
   */
  public async acceptIfNotRejected(): Promise<void> {
    if (!this.feedbackGiven) {
      await this.accept()
    }
  }
}
