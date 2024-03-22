import CardViewer from './CardViewer';
import { useState } from 'react';
import { CardTransform } from '../../data/CardTransform';

export default function GuesserBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);

    return (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '4px #4599de solid' }}>
            <span className="absolute text-gray-400 select-none text-3xl z-10">Guesser board</span>
            <CardViewer cards={cards} />
        </div>
    );
}