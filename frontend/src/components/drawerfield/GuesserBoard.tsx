import CardViewer from './CardViewer';
import { useState } from 'react';
import { CardTransform } from '../../data/CardTransform';
import { io } from 'socket.io-client';

export default function GuesserBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);
    /*let socket = io()

    socket.on('card-add', function(card: CardTransform){
        setCards([...cards, card]);
    })

    socket.on('card-move', function(i: number, transform: CardTransform) {
        cards[i] = transform;
        setCards([...cards]);
    });*/

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