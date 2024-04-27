import CardViewer from './CardViewer';
import {useEffect, useState} from 'react';
import {CardTransform} from '../../data/CardTransform';
import {Socket} from 'socket.io-client';
import {Vector2} from "../../data/Vector2";
import Interpolator from "./Interpolator";

export default function GuesserBoard({socket}: { socket: Socket | null }) {
    // the state of the cards
    let [actualCards, setActualCards] = useState([] as CardTransform[]);
    let [displayedCards, setDisplayedCards] = useState([] as CardTransform[]);

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

    function updateDisplayState(cards: CardTransform[]){
        setDisplayedCards(cards);
    }

    // TODO: funny rotation, handle different card counts
    function interpolateCardArray(from: CardTransform[], to: CardTransform[], progress: number): CardTransform[] {
        let result: CardTransform[] = [];

        if (from.length != to.length) {
            return [...to];
        }

        for (let i = 0; i < from.length; i++) {
            const fromCard = from[i];
            const toCard = to[i];

            const x = fromCard.position.x + (toCard.position.x - fromCard.position.x) * progress;
            const y = fromCard.position.y + (toCard.position.y - fromCard.position.y) * progress;
            const rotation = fromCard.rotation + (toCard.rotation - fromCard.rotation) * progress;
            const scale = fromCard.scale + (toCard.scale - fromCard.scale) * progress;

            result.push(new CardTransform(fromCard.id, new Vector2(x, y), rotation, scale));
        }

        return result;
    }

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700">
            <div className="flex justify-center w-full h-8 bg-sky-700 min-h-8"></div>

            <CardViewer
                cards={displayedCards}
            />

            <Interpolator
                initialState={[]}
                targetState={actualCards}
                stepCount={20}
                stepDurationMs={10}
                interpolatorFunction={interpolateCardArray}
                updateFunction={updateDisplayState}
            />
        </div>
    );
}