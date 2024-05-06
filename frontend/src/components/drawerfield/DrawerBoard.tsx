import {useState, useEffect} from 'react';
import Deck from './Deck';
import CardTransform from '../../data/CardTransform';
import Vector2 from '../../data/Vector2';
import {cardImages} from '../../data/ImageImports';
import {Socket} from 'socket.io-client';
import CardViewer from './CardViewer';
import {AddMessage, MoveMessage, RemoveMessage, RotateMessage, ScaleMessage, UpdateMessage} from "../../data/UpdateMessages";

// how close do we have to move the card to the edge of the board to remove it (in percentage)
const cardRemoveMargin: number = 1;

export default function DrawerBoard({lobbyId, socket}: { lobbyId: string, socket: Socket }) {
    // the state of the card array
    const [cards, setCards] = useState([] as CardTransform[]);

    // the indexes of the cards in the current selection
    const [selection, setSelection] = useState([] as number[]);

    // is the deck currently open
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    // is the left control key pressed
    const [isCtrlDown, setIsCtrlDown] = useState(false);

    // is the left mouse button is pressed
    const [isMouseDown, setIsMouseDown] = useState(false);

    // the time of the last card update
    const [lastUpdate, setLastUpdate] = useState(0);

    // the board as an HTML element
    const board: HTMLElement = document.getElementById("board") as HTMLElement;

    // the array of cards in the deck (all the cards currently not placed on the board)
    const cardsInDeck: number[] = cardImages.map((_, index) => index).filter(id => !cards.some(transform => transform.id === id));

    // handle keyboard and mouse events
    useEffect(() => {
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('mousemove', onMouseMove);

        // must remove event listeners, so they are not added multiple times
        return () => {
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('mousemove', onMouseMove);
        }
    });

    // handle mouse down event
    function onMouseDown(e: MouseEvent): void {
        // left mouse button is pressed
        if (e.button === 0) {
            setIsMouseDown(true);
        }
    }

    // handle mouse up event
    function onMouseUp(e: MouseEvent): void {
        // left mouse button released
        if (e.button === 0) {
            setIsMouseDown(false);
        }

        // no cards are selected, do nothing
        if (selection.length === 0) {
            return;
        }

        // ctrl is pressed, do nothing
        if (isCtrlDown) {
            return;
        }

        // get the ids of the cards that are moved outside the board
        const idsToRemove = cards.filter((card: CardTransform) => {
            const pos: Vector2 = card.position;

            return pos.x < cardRemoveMargin || pos.x > 100 - cardRemoveMargin || pos.y < cardRemoveMargin || pos.y > 100 - cardRemoveMargin;
        }).map((card: CardTransform) => card.id);

        // reset the selection
        setSelection([]);

        // remove the cards moved outside
        handleRemove(idsToRemove);
    }

    // handle key down events
    function onKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowLeft':
                // rotate the selection to the left
                handleRotate(-1);
                break;
            case 'ArrowRight':
                // rotate the selection to the right
                handleRotate(1);
                break;
            case 'ArrowUp':
                // scale the selection up
                handleScale(1.1);
                break;
            case 'ArrowDown':
                // scale the selection down
                handleScale(0.9);
                break;
            case 'Control':
                // left control key is pressed
                setIsCtrlDown(true);
                break;
        }
    }

    // handle key up events
    function onKeyUp(e: KeyboardEvent): void {
        // left control key is released
        if (e.key === 'Control') {
            setIsCtrlDown(false);
        }
    }

    // handle mouse movement
    function onMouseMove(e: MouseEvent): void {
        // prevent default dragging behaviour
        e.preventDefault();

        // do not move the cards if the mouse is not pressed
        if (!isMouseDown) {
            return;
        }

        // move the selection
        handleMove(e.movementX, e.movementY);
    }

    // add a card to the board
    function handleAdd(id: number): void {
        // calculate the duration of the update animation
        const duration: number = calculateDuration(50);

        // create an update message
        const message: AddMessage = new AddMessage(duration, id);

        // stream message to guessers
        socket.emit('board-add', lobbyId, message.duration, message.id);

        // apply the updates on drawer side
        applyMessage(message);

        // close the deck after adding a card
        setIsDeckOpen(false);
    }

    // remove cards from the board
    function handleRemove(ids: number[]): void {
        // no cards to remove, do nothing
        if (ids.length === 0) {
            return;
        }

        // calculate the duration of the update animation
        const duration: number = calculateDuration(50);

        // create an update message
        const message: RemoveMessage = new RemoveMessage(duration, ids);

        // stream message to guessers
        socket.emit('board-remove', lobbyId, message.duration, message.selection);

        // apply the updates on drawer side
        applyMessage(message);
    }

    // move the selected cards
    function handleMove(x: number, y: number): void {
        // no movement, do nothing
        if (x === 0 && y === 0) {
            return;
        }

        // no cards are selected, do nothing
        if (selection.length === 0) {
            return;
        }

        // calculate the vector of the movement
        const vector: Vector2 = new Vector2(x / board.offsetWidth * 100, y / board.offsetHeight * 100);

        // calculate the duration of the update animation
        const duration: number = calculateDuration(50);

        // create an update message
        const message: MoveMessage = new MoveMessage(duration, selection, vector);

        // stream message to guessers
        socket.emit('board-move', lobbyId, message.duration, message.selection, message.vector);

        // apply the updates on drawer side
        applyMessage(message);
    }

    // rotate the selected cards
    function handleRotate(direction: number): void {
        // calculate the angle of the rotation
        const angle: number = 15 * direction;

        // calculate the duration of the update animation
        const duration: number = calculateDuration(50);

        // create an update message
        const message: RotateMessage = new RotateMessage(duration, selection, angle);

        // stream message to guessers
        socket.emit('board-rotate', lobbyId, message.duration, message.selection, message.angle);

        // apply updates on drawer side
        applyMessage(message);
    }

    // scale the selected cards
    function handleScale(amount: number): void {
        // calculate the duration of the update animation
        const duration: number = calculateDuration(50);

        // create an update message
        const message: ScaleMessage = new ScaleMessage(duration, selection, amount);

        // stream message to guessers
        socket.emit('board-scale', lobbyId, message.duration, message.selection, message.scale);

        // apply the updates on drawer side
        applyMessage(message);
    }

    // select a card
    function selectCard(index: number): void {
        // ctrl is pressed
        if (isCtrlDown) {
            const matchIndex: number = selection.indexOf(index);

            // not selected -> add to selection
            if (matchIndex < 0) {
                setSelection([...selection, index]);
            }

            // already selected -> remove from selection
            else {
                setSelection(selection.filter((_, i) => i !== matchIndex));
            }
        }

        // set single card selection
        else {
            setSelection([index]);
        }
    }

    // calculate the duration of the update animation and set the last update time
    function calculateDuration(maxDuration: number): number {
        const now: number = Date.now();
        const elapsed: number = now - lastUpdate;

        setLastUpdate(now);

        return Math.min(elapsed, maxDuration);
    }

    // apply an update message to the cards
    function applyMessage(message: UpdateMessage): void {
        // apply the updates instantly
        const results: CardTransform[] = message.apply(cards, 1);

        // update the state
        setCards(results);
    }

    // template
    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700" onWheel={e => handleRotate(e.deltaY > 0 ? 1 : -1)}>
            <div className="flex justify-center w-full h-8 bg-sky-700 z-30">
                <label className="swap text-xl text-gray-300 h-100 px-8 bg-opacity-40 bg-black font-bold">
                    <input type="checkbox" checked={isDeckOpen} onChange={e => setIsDeckOpen(e.target.checked)}/>
                    <div className="swap-on text-red-600">Close deck</div>
                    <div className="swap-off text-green-600">Open deck</div>
                </label>
            </div>

            {isDeckOpen && <Deck
                onCardSelect={handleAdd}
                cardIds={cardsInDeck}
            />}

            <CardViewer
                cards={cards}
                selection={selection}
                onCardSelect={selectCard}
            />
        </div>
    );
}
