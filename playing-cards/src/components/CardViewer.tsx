import Card from './Card';
import { CardTransform } from '../data/CardTransform';
import { useState } from 'react';

export default function CardViewer({ canDraw }: { canDraw: boolean }) {
    const [cards, setCards] = useState([] as CardTransform[]);

    function addCard() {
        const card: CardTransform = new CardTransform();

        setCards([...cards, card]);

        /*
        // example socket events

        socket.emit('card-add', {card: card})

        socket.on('card-add', function(card: CardTransform){
            cards.push(card)
            setCards([...cards])
        })
        */
    }

    function moveCard(i: number) {
        if (!canDraw) return;

        cards[i].position.x += 50;
        cards[i].position.y += 50;

        setCards([...cards]);

        /*
        // example socket events

        socket.emit('card-move', {index: i, transform: cards[i]})

        socket.on('card-move', function(i: number, transform: CardTransform){
            cards[i] = transform
            setCards([...cards])
        })
        */
    }

    const cardList = cards.map((transform, i) => {
        return <Card key={i} transform={transform} selectCallback={() => moveCard(i)} />;
    });

    return (
        <div style={{ background: 'white', height: '75%', width: '75%', position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0 }}>
                {canDraw && <button onClick={addCard}>Add card</button>}
            </div>
            <section>{cardList}</section>
        </div>
    );
}