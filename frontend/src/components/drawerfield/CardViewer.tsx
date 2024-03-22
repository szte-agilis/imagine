import Card from './Card';
import { CardTransform } from '../../data/CardTransform';
import { MouseEvent, useState } from 'react';
import { io } from 'socket.io-client';

export default function CardViewer({ canDraw }: { canDraw: boolean }) {
    const pollFrequencyMs: number = 100;
    let [lastPoll, setLastPoll] = useState(Date.now());

    let [cards, setCards] = useState([] as CardTransform[]);
    let [selectedIndex, setSelectedIndex] = useState(-1);

    let socket = io()

    function addCard() {
        const card: CardTransform = new CardTransform(new Vector2(50, 100));

        setCards([...cards, card]);
        
        socket.emit('card-add', {card: card});
    }

    socket.on('card-add', function(card: CardTransform){
        setCards([...cards, card]);
    })


    function onCardSelect(i: number) {
        if (!canDraw) return;

        if (selectedIndex < 0) {
            selectedIndex = i;
        } else {
            selectedIndex = -1;
        }

        setSelectedIndex(selectedIndex);
    }

    function onMouseMove(e: MouseEvent) {
        if (!canDraw || selectedIndex < 0) return;

        const x = e.movementX;
        const y = e.movementY;

        cards[selectedIndex].position.x += x;
        cards[selectedIndex].position.y += y;

        setCards([...cards]);

        sendUpdates();
    }

    function sendUpdates() {
        const now: number = Date.now();
        const elapsed: number = now - lastPoll;

        if (elapsed >= pollFrequencyMs) {
            lastPoll = now;
            setLastPoll(lastPoll);

            socket.emit('card-move', { index: selectedIndex, transform: cards[selectedIndex] });
        }
    }

    socket.on('card-move', function(i: number, transform: CardTransform) {
        cards[i] = transform;
        setCards([...cards]);
    });

    const cardList = cards.map((transform, i) => {
        return (
            <Card
                key={i}
                transform={transform}
                selectCallback={() => {
                }}
            />
        );
    });

    return (
        <div className="size-full relative bg-slate-200">
            {cards.map((transform, i) => {
                return (
                    <Card key={i} transform={transform} />
                );
            })}
        </div>
    );
}
