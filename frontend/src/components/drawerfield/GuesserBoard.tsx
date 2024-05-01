import {useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import CardViewer, {addToBoard, interpolateCardArray, moveSelection, removeFromBoard, rotateSelection, scaleSelection} from './CardViewer';
import CardTransform from '../../data/CardTransform';
import Vector2 from "../../data/Vector2";
import Interpolator from "./Interpolator";

export default function GuesserBoard({socket}: { socket: Socket | null }) {
    // the state of the card array
    const [actualCards, setActualCards] = useState([] as CardTransform[]);

    // the displayed state of the card array
    const [displayedCards, setDisplayedCards] = useState([] as CardTransform[]);

    // handle socket events
    useEffect(() => {
        // if the socket is not connected, do nothing
        if (!socket) {
            return;
        }

        // add a single card to the board
        socket.on('board-add', function (id: number) {
            // add the card to the board
            const result: CardTransform[] = addToBoard(actualCards, id);

            // update the component state
            setActualCards(result);
        })

        // rotate the selection
        socket.on('board-rotate', function (selection: number[], angle: number) {
            // rotate the selection
            const result: CardTransform[] = rotateSelection(actualCards, selection, angle);

            // update the component state
            setActualCards(result);
        });

        // scale the selection
        socket.on('board-scale', function (selection: number[], scale: number) {
            // scale the selection
            const result: CardTransform[] = scaleSelection(actualCards, selection, scale);

            // update the component state
            setActualCards(result);
        });

        // move the selection
        socket.on('board-move', function (selection: number[], vector: Vector2) {
            // move the selection
            const result: CardTransform[] = moveSelection(actualCards, selection, vector);

            // update the component state
            setActualCards(result);
        });

        // clear the board
        socket.on('board-remove', function (ids: number[]) {
            // move the selection
            const result: CardTransform[] = removeFromBoard(actualCards, ids);

            // update the component state
            setActualCards(result);
        });

        // clear the board
        socket.on('board-reset', function () {
            setActualCards([]);
        });

        // must remove event listeners so they are not added multiple times
        return () => {
            socket.off('board-add');
            socket.off('board-rotate');
            socket.off('board-scale');
            socket.off('board-move');
            socket.off('board-reset');
        }
    }, [socket, setActualCards, actualCards]);

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700">
            <div className="flex justify-center w-full h-8 bg-sky-700 min-h-8"></div>

            <CardViewer
                cards={displayedCards}
            />

            <Interpolator
                targetState={actualCards}
                stepCount={20}
                stepDurationMs={10}
                onInterpolate={interpolateCardArray}
                onUpdate={setDisplayedCards}
            />
        </div>
    );
}