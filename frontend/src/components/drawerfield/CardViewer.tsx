import Card from './Card';
import { Vector2 } from '../../data/Vector2';
import { CardTransform } from '../../data/CardTransform';
import { MouseEvent, useState } from 'react';

export default function CardViewer({ canDraw }: { canDraw: boolean }) {
    const pollFrequencyMs: number = 100;
    let [lastPoll, setLastPoll] = useState(Date.now());

    let [cards, setCards] = useState([] as CardTransform[]);
    let [selectedIndex, setSelectedIndex] = useState(-1);

    function addCard() {
        const card: CardTransform = new CardTransform(new Vector2(50, 100));

        setCards([...cards, card]);

        /*

        socket.emit('card-add', {card: card})

        socket.on('card-add', function(card: CardTransform){
            cards.push(card)
            setCards([...cards])
        })

        */
    }

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

            /*

            socket.emit('card-move', { index: selectedIndex, transform: cards[selectedIndex] });

            socket.on('card-move', function(i: number, transform: CardTransform) {
                cards[i] = transform;
                setCards([...cards]);
            });

            */
        }
    }

    const cardList = cards.map((transform, i) => {
        return (
            <Card
                key={i}
                transform={transform}
                selectCallback={() => onCardSelect(i)}
            />
        );
    });

    return (
        <div
            style={{
                background: 'white',
                height: '100%',
                width: '100%',
                position: 'relative',
            }}
            onMouseMove={onMouseMove}
        >
            <div style={{ position: 'absolute', right: 0 }}>
                {canDraw && (
                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            margin: '10px',
                            backgroundColor: 'lightgreen',
                            borderRadius: '4px',
                        }}
                        onClick={addCard}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-plus-lg"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                            />
                        </svg>
                        <span style={{ marginLeft: '6px' }}>Add card</span>
                    </button>
                )}
            </div>
            <section>{cardList}</section>
        </div>
    );
}
