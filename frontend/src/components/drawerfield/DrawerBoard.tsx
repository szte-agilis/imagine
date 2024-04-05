import {MouseEvent, useState, useEffect, MouseEventHandler} from 'react';
import CardViewer from './CardViewer';
import Deck from './Deck';
import {CardTransform} from '../../data/CardTransform';
import {Vector2} from '../../data/Vector2';
import {io} from 'socket.io-client';
import {images} from './imageImports';

const pollFrequencyMs: number = 100;
const margin: number = 1;

export default function DrawerBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);
    let [lastPoll, setLastPoll] = useState(Date.now());
    let [isDeckOpen, setIsDeckOpen] = useState(false);
    let [selectedIndex, setSelectedIndex] = useState(-1);
    //let socket = io()

    useEffect(() => {
        window.addEventListener('mouseup', putDownCard)

        return () => window.removeEventListener('mouseup', putDownCard);
    })

    function pickupCard(i: number) {
        setSelectedIndex(i);
    }

    function putDownCard(e: globalThis.MouseEvent) {
        if (selectedIndex < 0) return;

        const position: Vector2 = cards[selectedIndex].position;

        if (position.x < margin || position.x > 100 - margin || position.y < margin || position.y > 100 - margin) {
            cards.splice(selectedIndex, 1);

            setCards([...cards]);

            // TODO emit card remove
            //socket.emit('card-remove', { index: selectedIndex });
        }

        setSelectedIndex(-1);
    }

    function moveCard(e: MouseEvent) {
        if (selectedIndex < 0) return;

        e.preventDefault();

        let board: HTMLElement = document.getElementById("board") as HTMLElement;

        const position: Vector2 = cards[selectedIndex].position;

        position.x = (e.clientX * 100) / board.offsetWidth;
        position.y = (e.clientY * 100) / board.offsetHeight;


        setCards([...cards]);

        const now: number = Date.now();
        const elapsed: number = now - lastPoll;

        if (elapsed >= pollFrequencyMs) {
            lastPoll = now;
            setLastPoll(lastPoll);

            // TODO emit card move
            //socket.emit('card-move', { index: selectedIndex, transform: cards[selectedIndex] });
        }
    }

    function addCard(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50), 0, 1);

        setCards([...cards, card]);

        setIsDeckOpen(false);

        //socket.emit('card-add', {card: card});
    }

    const cardsInDeck: number[] = images.map((_, index) => index).filter(id => !cards.some(transform => transform.id === id));

    return (
        <div id="board" className="h-full flex justify-center items-center relative border-4 border-slate-700" onMouseMove={moveCard}>
            <span className="absolute text-gray-400 select-none text-3xl z-10">Drawer board</span>

            <div className="absolute z-30 top-0">
                <label className="swap text-xl text-gray-300 rounded-b-lg bg-slate-700 px-8 pb-1">
                    <input type="checkbox" checked={isDeckOpen} onChange={e => setIsDeckOpen(e.target.checked)}/>
                    <div className="swap-on text-rose-300">Close deck</div>
                    <div className="swap-off text-green-300">Open deck</div>
                </label>
            </div>

            {isDeckOpen && <Deck onCardSelect={addCard} cardIds={cardsInDeck}/>}

            <CardViewer cards={cards} selectCallback={pickupCard}/>
        </div>
    );
}
