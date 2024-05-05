import {useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import CardTransform from '../../data/CardTransform';
import Vector2 from "../../data/Vector2";
import CardViewer from "./CardViewer";
import Interpolator from "./Interpolator";
import {AddMessage, MoveMessage, RemoveMessage, ResetMessage, RotateMessage, ScaleMessage, UpdateMessage} from "../../data/UpdateMessages";

export default function GuesserBoard({socket}: { socket: Socket | null }) {
    // the state of the card array
    const [cards, setCards] = useState([] as CardTransform[]);

    const [queue, setQueue] = useState([] as UpdateMessage[]);

    // handle socket events
    useEffect(() => {
        // if the socket is not connected, do nothing
        if (!socket) {
            return;
        }

        // add a single card to the board
        socket.on('board-add', (timestamp: number, id: number) => {
            const message: AddMessage = new AddMessage(0, id);

            queueMessage(message);
        });

        // clear the board
        socket.on('board-remove', (timestamp: number, selection: number[]) => {
            const message: RemoveMessage = new RemoveMessage(0, selection);

            queueMessage(message);
        });

        // rotate the selection
        socket.on('board-rotate', (timestamp: number, selection: number[], angle: number) => {
            const message: RotateMessage = new RotateMessage(50, selection, angle);

            queueMessage(message);
        });

        // scale the selection
        socket.on('board-scale', (timestamp: number, selection: number[], scale: number) => {
            const message: ScaleMessage = new ScaleMessage(50, selection, scale);

            queueMessage(message);
        });

        // move the selection
        socket.on('board-move', (timestamp: number, selection: number[], vector: Vector2) => {
            const message: MoveMessage = new MoveMessage(3, selection, vector);

            queueMessage(message);
        });

        // clear the board
        socket.on('board-reset', (timestamp: number) => {
            const message: ResetMessage = new ResetMessage(0);

            queueMessage(message);
        });

        // must remove event listeners, so they are not added multiple times
        return () => {
            socket.off('board-add');
            socket.off('board-remove');
            socket.off('board-rotate');
            socket.off('board-scale');
            socket.off('board-move');
            socket.off('board-reset');
        }
    }, [socket, queue, setQueue]);

    function queueMessage(message: UpdateMessage): void {
        setQueue(queue => [...queue, message]);
    }

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700">
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