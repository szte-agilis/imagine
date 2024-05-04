import {useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import CardTransform from '../../data/CardTransform';
import Vector2 from "../../data/Vector2";
import CardViewer from "./CardViewer";
import {AddMessage, MoveMessage, RemoveMessage, ResetMessage, RotateMessage, ScaleMessage, UpdateMessage} from "../../data/UpdateMessages";

export default function GuesserBoard({socket}: { socket: Socket | null }) {
    // the state of the card array
    const [cards, setCards] = useState([] as CardTransform[]);

    // handle socket events
    useEffect(() => {
        // if the socket is not connected, do nothing
        if (!socket) {
            return;
        }

        // add a single card to the board
        socket.on('board-add', (timestamp: number, id: number) => {
            const message: AddMessage = new AddMessage(timestamp, id);

            queueMessage(message);
        });

        // clear the board
        socket.on('board-remove', (timestamp: number, selection: number[]) => {
            const message: RemoveMessage = new RemoveMessage(timestamp, selection);

            queueMessage(message);
        });

        // rotate the selection
        socket.on('board-rotate', (timestamp: number, selection: number[], angle: number) => {
            const message: RotateMessage = new RotateMessage(timestamp, selection, angle);

            queueMessage(message);
        });

        // scale the selection
        socket.on('board-scale', (timestamp: number, selection: number[], scale: number) => {
            const message: ScaleMessage = new ScaleMessage(timestamp, selection, scale);

            queueMessage(message);
        });

        // move the selection
        socket.on('board-move', (timestamp: number, selection: number[], vector: Vector2) => {
            const message: MoveMessage = new MoveMessage(timestamp, selection, vector);

            queueMessage(message);
        });

        // clear the board
        socket.on('board-reset', (timestamp: number) => {
            const message: ResetMessage = new ResetMessage(timestamp);

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
    }, [socket, setCards, cards]);

    function queueMessage(message: UpdateMessage): void {
        setCards(message.apply(cards));
    }

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700">
            <div className="flex justify-center w-full h-8 bg-sky-700 min-h-8"></div>

            <CardViewer
                targetState={cards}
                stepCount={20}
                stepDurationMs={10}
            />
        </div>
    );
}