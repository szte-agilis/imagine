import CardViewer, { interpolateCardArray } from './CardViewer';
import {useEffect, useState} from 'react';
import CardTransform from '../../data/CardTransform';
import {Socket} from 'socket.io-client';
import Interpolator from "./Interpolator";

export default function GuesserBoard({socket}: { socket: Socket | null }) {
    // the state of the cards
    let [actualCards, setActualCards] = useState([] as CardTransform[]);
    const [displayedCards, setDisplayedCards] = useState([] as CardTransform[]);

    useEffect(() => {
        if(socket){
            socket.on('card-add', function(card: CardTransform){
                actualCards.push(card);
                setActualCards([...actualCards]);
            })

            socket.on('card-modify', function(transforms: CardTransform[]) {
                actualCards = transforms;
                setActualCards([...actualCards]);
            });

            socket.on('reset', function() {
                actualCards = [];
                setActualCards([...actualCards]);
            });
        }

        return () => {
            if (socket) {
                socket.off('card-add');
                socket.off('card-modify');
                socket.off('reset');
            }
        }
    }, [socket]);

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