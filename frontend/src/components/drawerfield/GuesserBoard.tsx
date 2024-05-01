import CardViewer, {interpolateCardArray} from './CardViewer';
import {useEffect, useState} from 'react';
import CardTransform from '../../data/CardTransform';
import {Socket} from 'socket.io-client';
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
        socket.on('card-add', function (card: CardTransform) {
            setActualCards([...actualCards, card]);
        })

        // refresh the board with the new card array
        socket.on('card-modify', function (transforms: CardTransform[]) {
            setActualCards(transforms);
        });

        // clear the board
        socket.on('reset', function () {
            setActualCards([]);
        });

        // must remove event listeners so they are not added multiple times
        return () => {
            socket.off('card-add');
            socket.off('card-modify');
            socket.off('reset');
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