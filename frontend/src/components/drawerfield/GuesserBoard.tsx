import {useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import CardTransform from '../../data/CardTransform';
import CardViewer from "./CardViewer";
import Interpolator from "./Interpolator";
import {AddMessage, MoveMessage, RemoveMessage, ResetMessage, RotateMessage, ScaleMessage, UpdateMessage} from "../../data/UpdateMessages";

export default function GuesserBoard({socket}: { socket: Socket }) {
    // the state of the card array
    const [cards, setCards] = useState([] as CardTransform[]);

    // the queue of update messages to be processed
    const [queue, setQueue] = useState([] as UpdateMessage[]);

    useEffect(() => {
        // add a single card to the board
        socket.on(AddMessage.eventName, (obj: object) => {
            const message: AddMessage = new AddMessage();
            Object.assign(message, obj);

            queueMessage(message);
        });

        // clear the board
        socket.on(RemoveMessage.eventName, (obj: object) => {
            const message: RemoveMessage = new RemoveMessage();
            Object.assign(message, obj);

            queueMessage(message);
        });

        // rotate the selection
        socket.on(RotateMessage.eventName, (obj: object) => {
            const message: RotateMessage = new RotateMessage();
            Object.assign(message, obj);

            queueMessage(message);
        });

        // scale the selection
        socket.on(ScaleMessage.eventName, (obj: object) => {
            const message: ScaleMessage = new ScaleMessage();
            Object.assign(message, obj);

            queueMessage(message);
        });

        // move the selection
        socket.on(MoveMessage.eventName, (obj: object) => {
            const message: MoveMessage = new MoveMessage();
            Object.assign(message, obj);

            queueMessage(message);
        });

        // clear the board
        socket.on(ResetMessage.eventName, (obj: object) => {
            const message: ResetMessage = new ResetMessage();
            Object.assign(message, obj);

            queueMessage(message);
        });

        // must remove event listeners, so they are not added multiple times
        return () => {
            socket.off(AddMessage.eventName);
            socket.off(RemoveMessage.eventName);
            socket.off(RotateMessage.eventName);
            socket.off(ScaleMessage.eventName);
            socket.off(MoveMessage.eventName);
            socket.off(ResetMessage.eventName);
        }
    }, [socket, queue, setQueue]);

    // add a message to the queue
    function queueMessage(message: UpdateMessage): void {
        setQueue(queue => [...queue, message]);
    }

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700 bg-sky-700 rounded">
            <div className="flex justify-center w-full h-8 bg-sky-700 min-h-8"></div>

            <CardViewer
                cards={cards}
            />

            <Interpolator
                state={cards}
                setState={setCards}
                queue={queue}
                setQueue={setQueue}
                updateFrequencyMs={20}
            />
        </div>
    );
}