type AsyncReaction = () => Promise<void>

export class AsyncFeedback<T> {
  private readonly _value: T
  private readonly _onAccepted: AsyncReaction[]
  private readonly _onRejected: AsyncReaction[]
  private feedbackGiven: boolean

  public constructor(value: T) {
    this._value = value
    this._onAccepted = []
    this._onRejected = []
    this.feedbackGiven = false
  }

  public get value(): T {
    return this._value
  }

  public onAccepted(reaction: AsyncReaction): void {
    this._onAccepted.unshift(reaction)
  }

  public onRejected(reaction: AsyncReaction): void {
    this._onRejected.unshift(reaction)
  }

  public async accept(): Promise<void> {
    if (this.feedbackGiven) {
      throw new Error('feedback given multiple times')
    }
    for (const reaction of this._onAccepted) {
      await reaction()
    }
    this.feedbackGiven = true
  }

  public async reject(): Promise<void> {
    if (this.feedbackGiven) {
      throw new Error('feedback given multiple times')
    }
    for (const reaction of this._onRejected) {
      await reaction()
    }
    this.feedbackGiven = true
  }
}
