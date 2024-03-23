import CardViewer from './CardViewer';
import { useState } from 'react';
import { CardTransform } from '../../data/CardTransform';

export default function GuesserBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);

    return (
        <div className="h-full flex justify-center items-center relative border-4 border-slate-700">
            <span className="absolute text-gray-400 select-none text-3xl z-10">Guesser board</span>
            <CardViewer cards={cards} />
        </div>
    );
}