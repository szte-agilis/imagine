import {useState, useEffect, WheelEvent} from 'react';
import CardViewer, {ASPECT_RATIO} from './CardViewer';
import Deck from './Deck';
import {CardTransform} from '../../data/CardTransform';
import {Vector2} from '../../data/Vector2';
import {transparentCards} from './imageImports';
import {Socket} from 'socket.io-client';

// the number of milliseconds to wait between card position updates
// lower number -> faster updates, smoother movement, more network and CPU used
const updateFrequencyMs: number = 100;

// how close do we have to move the card to the edge of the board to remove it (in percentage)
const cardRemoveMargin: number = 1;

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

    // the array of cards in the deck (all the cards currently not placed on the board)
    const cardsInDeck: number[] = transparentCards.map((_, index) => index).filter(id => !cards.some(transform => transform.id === id));

    // add event listeners to the window
    // wrap it in useEffect ensuring it is added only once
    useEffect(() => {
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        }
    });

    // handle mouse down event
    function onMouseDown(_: MouseEvent) {
        setIsMouseDown(true);
    }

    // handle mouse up event
    function onMouseUp(_: MouseEvent) {
        setIsMouseDown(false);

        if (selectedIndexes.length === 0) {
            return;
        }

        const indexesToRemove: number[] = selectedIndexes.filter(index => {
            const position: Vector2 = cards[index].position;

            return position.x < cardRemoveMargin || position.x > 100 - cardRemoveMargin || position.y < cardRemoveMargin || position.y > 100 - cardRemoveMargin;
        })

        if (socket) {
            socket.emit('card-remove', lobbyId, indexesToRemove);
        }

        if (!isCtrlDown) {
            setSelectedIndexes([]);
        }

        setCards(cards.filter((_, index) => !indexesToRemove.includes(index)));
    }

    // handle key down events
    function onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowLeft":
                rotateCards(-1);
                break;
            case "ArrowRight":
                rotateCards(1);
                break;
            case "ArrowUp":
                resizeCards(1.1);
                break;
            case "ArrowDown":
                resizeCards(0.9);
                break;
            case "Control":
                setIsCtrlDown(true);
                break;
        }
    }

    // handle key up events
    function onKeyUp(e: KeyboardEvent) {
        if (e.key === 'Control') {
            setIsCtrlDown(false);
        }
    }

    // handle mouse movement
    function onMouseMove(e: MouseEvent) {
        // prevent default dragging behaviour
        e.preventDefault();

        // no cards to move
        if (selectedIndexes.length === 0) {
            return;
        }

        // do not move the cards if the mouse is not pressed
        if (!isMouseDown) {
            return;
        }

        // modify the position of all selected cards
        selectedIndexes.forEach(index => {
            const position: Vector2 = cards[index].position;

            position.x += (e.movementX * 100) / board.offsetWidth;
            position.y += (e.movementY * 100) / board.offsetHeight;
        })

        const now: number = Date.now();
        const elapsed: number = now - lastUpdate;

        if (elapsed >= updateFrequencyMs) {
            setLastUpdate(now);

            if (socket) {
                socket.emit('card-modify', lobbyId, cards);
            }
        }

        // update cards
        setCards([...cards]);
    }

    // select a card
    function selectCard(index: number) {
        // ctrl is pressed
        if (isCtrlDown) {
            const matchIndex: number = selectedIndexes.indexOf(index);

            // not selected -> add to selection
            if (matchIndex < 0) {
                selectedIndexes.push(index);
                setSelectedIndexes([...selectedIndexes]);
            }

            // already selected -> remove from selection
            else {
                selectedIndexes.splice(matchIndex, 1);
                setSelectedIndexes([...selectedIndexes]);
            }
        }

        // set single card selection
        else {
            setSelectedIndexes([index]);
        }
    }

    // get the center of the current card selection
    function getSelectionCenter(): Vector2 {
        const selectedCards: CardTransform[] = selectedIndexes.map(index => cards[index]);

        const posX: number[] = selectedCards.map(a => a.position.x)
        const posY: number[] = selectedCards.map(b => b.position.y)

        const minX: number = Math.min(...posX);
        const minY: number = Math.min(...posY);
        const maxX: number = Math.max(...posX);
        const maxY: number = Math.max(...posY);

        return new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
    }

    // add a card to the board
    function addCard(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50));
        setCards([...cards, card]);
        setIsDeckOpen(false);

        if (socket) {
            socket.emit('card-add', lobbyId, card);
        }
    }

    // rotate the selected cards
    function rotateCards(direction: number) {
        if (selectedIndexes.length === 0) {
            return;
        }

        const ANGLE_DEG_AMOUNT: number = 15.0;
        const ANGLE_RAD_AMOUNT: number = ANGLE_DEG_AMOUNT * Math.PI / 180.0;

        const pivotPos: Vector2 = getSelectionCenter();
        const angleRad: number = ANGLE_RAD_AMOUNT * direction;
        const angleDeg: number = ANGLE_DEG_AMOUNT * direction;
        const cosTheta: number = Math.cos(angleRad);
        const sinTheta: number = Math.sin(angleRad);

        selectedIndexes.forEach((value) => {
            const card: CardTransform = cards[value];
            const posX: number = card.position.x
            const posY: number = card.position.y

            // Normalize x coordinate by aspect ratio
            const normalizedX = posX * ASPECT_RATIO;
            const normalizedY = posY;

            // Calculate normalized pivot
            const normalizedPivotX = pivotPos.x * ASPECT_RATIO;
            const normalizedPivotY = pivotPos.y;

            // Translate to origin based on normalized pivot
            const translatedX = normalizedX - normalizedPivotX;
            const translatedY = normalizedY - normalizedPivotY;

            // Rotate
            const rotatedX = cosTheta * translatedX - sinTheta * translatedY;
            const rotatedY = sinTheta * translatedX + cosTheta * translatedY;

            // Translate back and convert back to percentage coordinates
            const newX = (rotatedX + normalizedPivotX) / ASPECT_RATIO; // De-normalize x coordinate
            const newY = rotatedY + normalizedPivotY;

            card.position.x = newX;
            card.position.y = newY;

            card.rotation = (cards[value].rotation + angleDeg + 360) % 360;
        })

        if (socket) {
            socket.emit('card-modify', lobbyId, cards);
        }

        setCards([...cards]);
    }

    // resize the selected cards
    function resizeCards(size: number) {
        if (selectedIndexes.length === 0) {
            return;
        }

        let scalingFactor: number = size;

        selectedIndexes.forEach(index => {
            if (index < 0 || index >= cards.length) {
                return;
            }

            let scale = cards[index].scale * size;

            scale = Math.min(0.9, Math.max(0.1, scale));


            let actualSize = scale / cards[index].scale;

            if (size < 1) {
                scalingFactor = Math.max(scalingFactor, actualSize);
            } else {
                scalingFactor = Math.min(scalingFactor, actualSize);
            }

        })

        const pivotPos: Vector2 = getSelectionCenter();

        selectedIndexes.forEach(index => {
            if (index < 0 || index >= cards.length) {
                return;
            }

            cards[index].scale *= scalingFactor;

            // subtraction of card position and center
            let cardPivotDifference: Vector2 = Vector2.sub(cards[index].position, pivotPos);

            // card and center difference change
            cardPivotDifference = Vector2.mul(cardPivotDifference, scalingFactor);

            // set card new shifted position
            cards[index].position = Vector2.add(pivotPos, cardPivotDifference);

        });

        if (socket) {
            socket.emit('card-modify', lobbyId, cards);
        }

        setCards([...cards]);
    }

    // template
    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700" onWheel={e => rotateCards(e.deltaY > 0 ? 1 : -1)}>
            <div className="flex justify-center w-full h-8 bg-sky-700 z-30">
                <label className="swap text-xl text-gray-300 h-100 px-8 bg-opacity-40 bg-black font-bold">
                    <input type="checkbox" checked={isDeckOpen} onChange={e => setIsDeckOpen(e.target.checked)}/>
                    <div className="swap-on text-red-600">Close deck</div>
                    <div className="swap-off text-green-600">Open deck</div>
                </label>
            </div>

            {isDeckOpen && <Deck onCardSelect={addCard} cardIds={cardsInDeck}/>}

            <div id="board" className="flex-grow relative">
                <CardViewer cards={cards} selectedIndexes={selectedIndexes} selectCallback={selectCard}/>
            </div>
        </div>
    );
}
