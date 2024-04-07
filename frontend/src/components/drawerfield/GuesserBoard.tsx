import CardViewer from './CardViewer';
import {useEffect, useState} from 'react';
import { CardTransform } from '../../data/CardTransform';
import {Socket} from 'socket.io-client';

export default function GuesserBoard({socket}: {socket: Socket | null}) {
    let [cards, setCards] = useState([] as CardTransform[]);

    useEffect(() => {
        if(socket){
            socket.on('card-add', function(card: CardTransform){
                setCards([...cards, card]);
            })

            socket.on('card-move', function(i: number, card: CardTransform) {
                cards[i] = card;
                setCards([...cards]);
            });
        }

        return () => {
            if(socket){
                socket.off('card-add');
                socket.off('card-move');
            }
        }
    });

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700">
            <div className="flex justify-center w-full h-8 bg-sky-700 min-h-8"></div>

            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 select-none text-3xl z-10">
                Guesser board
            </span>

            <CardViewer cards={cards}/>
        </div>
    );
}