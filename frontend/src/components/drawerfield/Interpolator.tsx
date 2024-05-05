import {useEffect} from "react";
import {UpdateMessage} from "../../data/UpdateMessages";
import CardTransform from "../../data/CardTransform";

export default function Interpolator(
    {
        state,
        setState,
        queue,
        setQueue,
        updateFrequencyMs
    }: {
        state: CardTransform[],
        setState: (state: CardTransform[]) => void,
        queue: UpdateMessage[]
        setQueue: (queue: UpdateMessage[]) => void,
        updateFrequencyMs: number
    }) {

    useEffect(() => {
        const id = setInterval(() => {
            // if the queue is empty, do nothing
            if (queue.length === 0) {
                return;
            }

            // copy the state and queue to local variables
            let localState: CardTransform[] = [...state];
            const localQueue: UpdateMessage[] = [...queue];

            // set the remaining time to the update frequency
            let remainingTime: number = updateFrequencyMs;

            // iterate through the queue and apply the updates
            // while there are items in the queue and there is time remaining
            while (localQueue.length > 0 && remainingTime > 0) {
                // get the first update in the queue
                const update = localQueue[0];

                // get the duration of the update
                const updateDuration: number = Math.min(remainingTime, update.duration);

                // calculate the progress of the update, from 0 to 1
                const progress: number = updateDuration === 0 ? 1 : updateDuration / update.duration;

                // apply the update to the state
                // update the progress of the update
                localState = update.apply(localState, progress);

                // if the update is complete, remove it from the queue
                if (update.duration < 0.001) {
                    localQueue.shift();
                }

                // decrease the remaining time
                remainingTime -= updateDuration;
            }

            // update the parent state and queue
            setState(localState);
            setQueue(localQueue);
        }, updateFrequencyMs);

        // cleanup function
        return () => {
            clearInterval(id);
        }
    }, [queue, setQueue, updateFrequencyMs]);

    // render nothing
    return <></>
}