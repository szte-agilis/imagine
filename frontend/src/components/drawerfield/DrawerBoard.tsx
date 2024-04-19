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

export default function DrawerBoard({lobbyId, socket}: { lobbyId: string | null, socket: Socket | null }) {
    // the array storing the transforms of the currently placed cards
    const [cards, setCards] = useState([] as CardTransform[]);

    // the time of the last card movement update
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // is the deck currently open
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    // array to store the indexes of the selected cards
    const [selectedIndexes, setSelectedIndexes] = useState([] as number[]);

    // is the left control key pressed
    const [isCtrlDown, setIsCtrlDown] = useState(false);

    // is the left mouse button is pressed
    const [isMouseDown, setIsMouseDown] = useState(false);

    // the board HTML element
    const board: HTMLElement = document.getElementById("board") as HTMLElement;

    // add event listeners to the window
    // wrap it in useEffect ensuring it is added only once
    useEffect(() => {
        window.addEventListener('mouseup', putDownCard);
        window.addEventListener('mousemove', moveCard);
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown)


        return () => {
            window.removeEventListener('mouseup', putDownCard);
            window.removeEventListener('mousemove', moveCard);
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown)
        }
    });

    function handleKeyPress(e: KeyboardEvent) {

        switch (e.key) {
            case "ArrowLeft":
                rotate(-1);
                break;
            case "ArrowRight":
                rotate(1);
                break;
            case "ArrowUp":
                /*sizing(1);*/

                break;
            case "ArrowDown":
                /*sizing(-1);*/
                break;
            case"Control":
                setIsCtrlDown(true);
                break;

        }
    }

    function handleKeyUp(e: KeyboardEvent) {
        if (e.key === 'Control') {
            setIsCtrlDown(false);
        }
    }

    function handleMouseDown(e: MouseEvent) {
        if (onmousedown) {
            setIsMouseDown(true);
        }
    }

    // pick up and start moving the card with the index 'i'
    // if control is held down multiple cards can be selected
    function pickupCard(i: number) {

        console.log("cards:", cards);

        if (isCtrlDown) {
            if (!selectedIndexes.includes(i)) {
                setSelectedIndexes([...selectedIndexes, i]);
            }
        } else {
            setSelectedIndexes([i]);
        }
    }


    // put down the currently selected card
    function putDownCard(e: globalThis.MouseEvent) {
        if (selectedIndexes.length === 0) return;

        const position: Vector2 = multipleSelectionCenter();

        if (position.x < margin || position.x > 100 - margin || position.y < margin || position.y > 100 - margin) {

            setCards(cards.filter((p, i) => !selectedIndexes.includes(i)));

            /*if(socket){
                socket.emit('card-remove', lobbyId, selectedIndex);
            }*/
        }

        if (!isCtrlDown) {
            setSelectedIndexes([]);
        }
    }

    function multipleSelectionCenter(): Vector2 {
        const selectedCards: CardTransform[] = cards.filter((_, index) => selectedIndexes.includes(index));

        const posX: number[] = selectedCards.map(a => a.position.x)
        const posY: number[] = selectedCards.map(b => b.position.y)

        const minX: number = Math.min(...posX);
        const minY: number = Math.min(...posY);
        const maxX: number = Math.max(...posX);
        const maxY: number = Math.max(...posY);

        return new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
    }

    // move the selected card
    // if multiple cards are selected move them together
    function moveCard(e: globalThis.MouseEvent) {
        if (selectedIndexes.length === 0) return;

        if (selectedIndexes.length >= 1 && isCtrlDown && !isMouseDown) {
            return;
        }

        if (!isMouseDown) {

            e.preventDefault();

            selectedIndexes.forEach((value, key) => {
                const position: Vector2 = cards[value].position;

                position.x += (e.movementX * 100) / board.offsetWidth;
                position.y += (e.movementY * 100) / board.offsetHeight;
            })

            setCards([...cards]);

            const now: number = Date.now();
            const elapsed: number = now - lastUpdate;

            if (elapsed >= updateFrequencyMs) {
                setLastUpdate(now);

                /*if(socket){
                    socket.emit('card-modify', lobbyId, selectedIndex, cards[selectedIndex]);
                }*/
            }
        }
    }

    // add a card to the board from the deck
    function addCard(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50));
        setCards([...cards, card]);
        setIsDeckOpen(false);

        if (socket) {
            socket.emit('card-add', lobbyId, card);
        }
    }

    // rotate the selected card
    function rotateCard(e: any) {
        rotate(e.deltaY > 0 ? 1 : -1);
    }

    // rotate the selected card
    function rotate(direction: number) {
        if (selectedIndexes.length < 1){
            return;
        }

        const ANGLE_DEG_AMOUNT: number = 15.0;
        const ANGLE_RAD_AMOUNT: number = ANGLE_DEG_AMOUNT * Math.PI / 180.0;

        const pivotPos: Vector2 = multipleSelectionCenter();
        const angleRad: number = ANGLE_RAD_AMOUNT * direction;
        const angleDeg: number = ANGLE_DEG_AMOUNT * direction;
        const cosTheta: number = Math.cos(angleRad);
        const sinTheta: number = Math.sin(angleRad);

        selectedIndexes.forEach((value) => {
            const card: CardTransform = cards[value];
            const posX: number = card.position.x
            const posY: number = card.position.y

            const newPosX: number = (posX - pivotPos.x) * cosTheta - (posY - pivotPos.y) * sinTheta + pivotPos.x;
            const newPosY: number = (posX - pivotPos.x) * sinTheta + (posY - pivotPos.y) * cosTheta + pivotPos.y;

            card.position.x = newPosX;
            card.position.y = newPosY;

            card.rotation = (cards[value].rotation + angleDeg + 360) % 360;
        })

        setCards([...cards]);

        // if(socket){
        //     socket.emit('card-modify', lobbyId, selectedIndex, cards[selectedIndex]);
        // }
    }

    /*function sizing(size: number) {
        if (selectedIndexes.length === 0){
            return;
        }

        selectedIndexes.forEach(index => {
            if (index < 0 || index >= cards.length){
                return;
            }

            cards[index].scale += size;

            if (cards[index].scale > 0.9) {
                cards[index].scale = 0.9;
            }
            else if (cards[index].scale < 0.1) {
                cards[index].scale = 0.1;
            }

            if (socket) {
                socket.emit('card-modify', lobbyId, index, cards[index]);
            }
        });

        setCards([...cards]);
    }*/

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
                <CardViewer cards={cards} selectedIndexes={selectedIndexes} selectCallback={pickupCard}/>
            </div>
        </div>
    );
}
