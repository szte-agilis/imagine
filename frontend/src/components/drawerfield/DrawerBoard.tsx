import {MouseEvent, useState, useEffect} from 'react';
import CardViewer from './CardViewer';
import Deck from './Deck';
import {CardTransform} from '../../data/CardTransform';
import {Vector2} from '../../data/Vector2';
import {images} from './imageImports';
import {io} from 'socket.io-client';

// the number of milliseconds to wait between card position updates
// lower number -> faster updates, smoother movement, more network and CPU used
const updateFrequencyMs: number = 100;

// how close do we have to move the card to the edge of the board to remove it (in percentage)
const margin: number = 1;

export default function DrawerBoard() {
    // the array storing the transforms of the currently placed cards
    let [cards, setCards] = useState([] as CardTransform[]);

    // the time of the last card movement update
    let [lastUpdate, setLastUpdate] = useState(Date.now());

    // is the deck currently open
    let [isDeckOpen, setIsDeckOpen] = useState(false);

    // the index of the selected card in the cards array, -1 if no card is selected
    let [selectedIndex, setSelectedIndex] = useState(-1);

    // TODO socket connection
    //let socket = io()

    // add a listener to the window for the mouse up event
    // need this for removing cards even when moved outside the board
    // wrap it in useEffect ensuring it is added only once
    useEffect(() => {
        window.addEventListener('mouseup', putDownCard)

        return () => window.removeEventListener('mouseup', putDownCard);
    })

    // pick up and start moving the card with the index 'i'
    function pickupCard(i: number) {
        setSelectedIndex(i);
    }

    // put down the currently selected card
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

    // move the selected card
    function moveCard(e: MouseEvent) {
        if (selectedIndex < 0) return;

        e.preventDefault();

        let board: HTMLElement = document.getElementById("board") as HTMLElement;

        const position: Vector2 = cards[selectedIndex].position;

        position.x = (e.clientX * 100) / board.offsetWidth;
        position.y = (e.clientY * 100) / board.offsetHeight;


        setCards([...cards]);

        const now: number = Date.now();
        const elapsed: number = now - lastUpdate;

        if (elapsed >= updateFrequencyMs) {
            lastUpdate = now;
            setLastUpdate(lastUpdate);

            // TODO emit card move
            //socket.emit('card-move', { index: selectedIndex, transform: cards[selectedIndex] });
        }
    }

    // add a card to the board from the deck
    function addCard(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50), 0, 1);

        setCards([...cards, card]);

        setIsDeckOpen(false);

        // TODO emit card add
        //socket.emit('card-add', {card: card});
    }

    // the array of cards in the deck, that are all the cards currently not placed on the board
    const cardsInDeck: number[] = images.map((_, index) => index).filter(id => !cards.some(transform => transform.id === id));

    // template
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
