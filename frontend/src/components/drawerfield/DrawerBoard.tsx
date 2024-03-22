import { MouseEvent, useState } from 'react';
import CardViewer from './CardViewer';
import Deck from './Deck';
import { CardTransform } from '../../data/CardTransform';
import { Vector2 } from '../../data/Vector2';
import { io } from 'socket.io-client';

const pollFrequencyMs: number = 100;

export default function DrawerBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);
    let [lastPoll, setLastPoll] = useState(Date.now());
    let [isDeckOpen, setIsDeckOpen] = useState(false);
    let [selectedIndex, setSelectedIndex] = useState(-1);
    let socket = io()

    socket.on('card-add', function(card: CardTransform){
        setCards([...cards, card]);
    })

    function onCardSelect(i: number) {
        if (selectedIndex < 0) {
            selectedIndex = i;
        } else {
            selectedIndex = -1;
        }

        setSelectedIndex(selectedIndex);
    }

    function onMouseMove(e: MouseEvent) {
        if (selectedIndex < 0) return;

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

    function addCardFromDeck(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 100), 0, 1);

        setCards([...cards, card]);

        console.log(`add ${id}`);

        setIsDeckOpen(false);

        socket.emit('card-add', {card: card});
    }

    /*
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


        }
    }*/

    return (
        <div className="h-full flex justify-center items-center relative border-4 border-amber-600" onMouseMove={onMouseMove}>
            <span className="absolute text-gray-400 select-none text-3xl z-10">Drawer board</span>

            <div className="absolute z-30 top-0">
                <label className="swap text-xl text-gray-300 rounded-b-lg bg-slate-800 px-8 pb-1">
                    <input type="checkbox" checked={isDeckOpen} onChange={e => setIsDeckOpen(e.target.checked)} />
                    <div className="swap-on text-rose-300">Close deck</div>
                    <div className="swap-off text-green-300">Open deck</div>
                </label>
            </div>

            {isDeckOpen && <Deck onCardSelect={addCardFromDeck} cardIds={Array.from(Array(100).keys())} />}

            <CardViewer cards={cards} />
        </div>
    );
}