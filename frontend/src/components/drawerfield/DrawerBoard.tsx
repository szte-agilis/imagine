import {useState, useEffect} from 'react';
import CardViewer from './CardViewer';
import Deck from './Deck';
import {CardTransform} from '../../data/CardTransform';
import {Vector2} from '../../data/Vector2';
import {images} from './imageImports';
import {Socket} from 'socket.io-client';

// the number of milliseconds to wait between card position updates
// lower number -> faster updates, smoother movement, more network and CPU used
const updateFrequencyMs: number = 100;

// how close do we have to move the card to the edge of the board to remove it (in percentage)
const margin: number = 1;

export default function DrawerBoard({lobbyId, socket}: {lobbyId: string | null, socket: Socket | null}) {
    // the array storing the transforms of the currently placed cards
    const [cards, setCards] = useState([] as CardTransform[]);

    // the time of the last card movement update
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // is the deck currently open
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    // the index of the selected card in the cards array, -1 if no card is selected
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // the board HTML element
    const board: HTMLElement = document.getElementById("board") as HTMLElement;

    // add event listeners to the window
    // wrap it in useEffect ensuring it is added only once
    useEffect(() => {
        window.addEventListener('mouseup', putDownCard);
        window.addEventListener('mousemove', moveCard);
        window.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('mouseup', putDownCard);
            window.removeEventListener('mousemove', moveCard);
            window.removeEventListener('keydown', handleKeyPress)
        }
    });

    function handleKeyPress(e: KeyboardEvent){
        switch (e.key) {
            case "ArrowLeft":
                rotate(-1);
                break;
            case "ArrowRight":
                rotate(1);
                break;
        }
    }

    // pick up and start moving the card with the index 'i'
    function pickupCard(i: number) {
        if (selectedIndex < 0) {
            setSelectedIndex(i);
        } else {
            setSelectedIndex(-1);
        }
    }

    // put down the currently selected card
    function putDownCard(e: globalThis.MouseEvent) {
        if (selectedIndex < 0) return;

        const position: Vector2 = cards[selectedIndex].position;

        if (position.x < margin || position.x > 100 - margin || position.y < margin || position.y > 100 - margin) {
            cards.splice(selectedIndex, 1);

            setCards([...cards]);

            if(socket){
                socket.emit('card-remove', lobbyId, selectedIndex);
            }
        }

        setSelectedIndex(-1);
    }

    // move the selected card
    function moveCard(e: globalThis.MouseEvent) {
        if (selectedIndex < 0) return;

        e.preventDefault();

        const position: Vector2 = cards[selectedIndex].position;

        position.x += (e.movementX * 100) / board.offsetWidth;
        position.y += (e.movementY * 100) / board.offsetHeight;

        setCards([...cards]);

        const now: number = Date.now();
        const elapsed: number = now - lastUpdate;

        if (elapsed >= updateFrequencyMs) {
            setLastUpdate(now);

            if(socket){
                socket.emit('card-modify', lobbyId, selectedIndex, cards[selectedIndex]);
            }
        }
    }

    // add a card to the board from the deck
    function addCard(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50), 0, 1);

        setCards([...cards, card]);

        setIsDeckOpen(false);

        if(socket){
            socket.emit('card-add', lobbyId, card);
        }
    }

    // rotate the selected card
    function rotateCard(e: any) {
        rotate(e.deltaY > 0 ? 1 : -1);
    }

    // rotate the selected card
    function rotate(direction: number) {
        if (selectedIndex < 0) return;

        cards[selectedIndex].rotation = (cards[selectedIndex].rotation + direction * 15 + 360) % 360;

        setCards([...cards]);

        if(socket){
            socket.emit('card-modify', lobbyId, selectedIndex, cards[selectedIndex]);
        }
    }

    // the array of cards in the deck, that are all the cards currently not placed on the board
    const cardsInDeck: number[] = images.map((_, index) => index).filter(id => !cards.some(transform => transform.id === id));

    // template
    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700" onWheel={rotateCard}>
            <div className="flex justify-center w-full h-8 bg-sky-700 z-30">
                <label className="swap text-xl text-gray-300 h-100 px-8 bg-opacity-40 bg-black font-bold">
                    <input type="checkbox" checked={isDeckOpen} onChange={e => setIsDeckOpen(e.target.checked)}/>
                    <div className="swap-on text-red-600">Close deck</div>
                    <div className="swap-off text-green-600">Open deck</div>
                </label>
            </div>

            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 select-none text-3xl z-10">
                Drawer board
            </span>

            {isDeckOpen && <Deck onCardSelect={addCard} cardIds={cardsInDeck}/>}

            <div id="board" className="flex-grow relative">
                <CardViewer cards={cards} selectedIndex={selectedIndex} selectCallback={pickupCard}/>
            </div>
        </div>
    );
}
