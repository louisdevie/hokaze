import { AsyncFeedback } from "@module/feedback"

describe('AsyncFeedback', () => {
    test('wrapping a value', () => {
        const feedback = new AsyncFeedback(1)
        expect(feedback.value).toBe(1)
    })

    test('triggering accepted reactions', async () => {
        const callOrder: string[] = []
        const reactionX = async () => { callOrder.push('X') }
        const reactionY = async () => { callOrder.push('Y') }
        const reactionZ = async () => { callOrder.push('Z') }

        const feedback = new AsyncFeedback(1)
        feedback.onAccepted(reactionX)
        feedback.onAccepted(reactionY)
        feedback.onRejected(reactionZ)

        await feedback.accept()

        // the last one added is called first,
        // and Z isn't called because it handles rejection
        expect(callOrder).toEqual(['Y', 'X'])
    })

    test('triggering rejected reactions', async () => {
        const callOrder: string[] = []
        const reactionX = async () => { callOrder.push('X') }
        const reactionY = async () => { callOrder.push('Y') }
        const reactionZ = async () => { callOrder.push('Z') }

        const feedback = new AsyncFeedback(1)
        feedback.onRejected(reactionX)
        feedback.onRejected(reactionY)
        feedback.onAccepted(reactionZ)

        await feedback.reject()

        // the last one added is called first,
        // and Z isn't called because it handles success
        expect(callOrder).toEqual(['Y', 'X'])
    })
})