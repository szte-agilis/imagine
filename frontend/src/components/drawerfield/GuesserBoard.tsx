import CardViewer from './CardViewer';
import { useState } from 'react';
import { CardTransform } from '../../data/CardTransform';
import { io } from 'socket.io-client';

export default function GuesserBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);
    let socket = io()

    socket.on('card-add', function(card: CardTransform){
        setCards([...cards, card]);
    })

    socket.on('card-move', function(i: number, transform: CardTransform) {
        cards[i] = transform;
        setCards([...cards]);
    });

    return (
        <div className="h-full flex justify-center items-center relative border-4 border-slate-700">
            <span className="absolute text-gray-400 select-none text-3xl z-10">Guesser board</span>
            <CardViewer cards={cards} />
        </div>
    );
}