import {useState, useEffect} from 'react';
import CardViewer, { scaleSelection, rotateSelection, moveSelection, interpolateCardArray } from './CardViewer';
import Deck from './Deck';
import CardTransform from '../../data/CardTransform';
import Vector2 from '../../data/Vector2';
import {cardImages} from '../../data/ImageImports';
import {Socket} from 'socket.io-client';
import Interpolator from './Interpolator';

// the number of milliseconds to wait between card position updates
// lower number -> faster updates, smoother movement, more network and CPU used
const updateFrequencyMs: number = 100;

// how close do we have to move the card to the edge of the board to remove it (in percentage)
const cardRemoveMargin: number = 1;

export default function DrawerBoard({lobbyId, socket}: { lobbyId: string | null, socket: Socket | null }) {
    // the array storing the transforms of the currently placed cards
    const [actualCards, setActualCards] = useState([] as CardTransform[]);

    const [displayedCards, setDisplayedCards] = useState([] as CardTransform[]);

    // array to store the indexes of the selected cards
    const [selection, setSelection] = useState([] as number[]);

    // the time of the last card movement update
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // is the deck currently open
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    // is the left control key pressed
    const [isCtrlDown, setIsCtrlDown] = useState(false);

    // is the left mouse button is pressed
    const [isMouseDown, setIsMouseDown] = useState(false);

    // the board HTML element
    const board: HTMLElement = document.getElementById("board") as HTMLElement;

    // the array of cards in the deck (all the cards currently not placed on the board)
    const cardsInDeck: number[] = cardImages.map((_, index) => index).filter(id => !actualCards.some(transform => transform.id === id));

    // add event listeners to the window
    // wrap it in useEffect ensuring it is added only once
    useEffect(() => {
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onCardMove);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onCardMove);
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
        // mouse button is no longer pressed
        setIsMouseDown(false);

        // nothing to do when no cards are selected
        if(selection.length === 0){
            return;
        }

        // do not reset selection when ctrl is pressed
        if (isCtrlDown) {
            // still stream updates so the board looks the same for everyone
            if(socket){
                socket.emit('card-modify', lobbyId, actualCards);
            }

            return;
        }

        // get the cards that will stay on the board
        const remainingCards: CardTransform[] = actualCards.filter(card => {
            const position: Vector2 = card.position;

            return position.x > cardRemoveMargin && position.x < 100 - cardRemoveMargin && position.y > cardRemoveMargin && position.y < 100 - cardRemoveMargin;
        });

        // reset selection and delete the cards moved outside
        setSelection([]);
        setActualCards(remainingCards);

        // stream changes
        if (socket) {
            socket.emit('card-modify', lobbyId, remainingCards);
        }
    }

    // handle key down events
    function onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowLeft":
                handleRotate(-1);
                break;
            case "ArrowRight":
                handleRotate(1);
                break;
            case "ArrowUp":
                handleScale(1.1);
                break;
            case "ArrowDown":
                handleScale(0.9);
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
    function onCardMove(e: MouseEvent) {
        // prevent default dragging behaviour
        e.preventDefault();

        // do not move the cards if the mouse is not pressed
        if (!isMouseDown) {
            return;
        }

        moveSelection(actualCards, selection, new Vector2(e.movementX, e.movementY), new Vector2(board.offsetWidth, board.offsetHeight));

        const now: number = Date.now();
        const elapsed: number = now - lastUpdate;

        if (elapsed >= updateFrequencyMs) {
            setLastUpdate(now);

            if (socket) {
                socket.emit('card-modify', lobbyId, actualCards);
            }
        }

        // update cards
        setActualCards([...actualCards]);
    }

    function handleRotate(direction: number){
        const amountDeg = 15 * direction;

        rotateSelection(actualCards, selection, amountDeg);

        if(socket){
            socket.emit('card-modify', lobbyId, actualCards);
        }

        setActualCards([...actualCards]);
    }

    function handleScale(amount: number){
        scaleSelection(actualCards, selection, amount);

        if(socket){
            socket.emit('card-modify', lobbyId, actualCards);
        }

        setActualCards([...actualCards]);
    }

    // select a card
    function selectCard(index: number) {
        // ctrl is pressed
        if (isCtrlDown) {
            const matchIndex: number = selection.indexOf(index);

            // not selected -> add to selection
            if (matchIndex < 0) {
                selection.push(index);
                setSelection([...selection]);
            }

            // already selected -> remove from selection
            else {
                selection.splice(matchIndex, 1);
                setSelection([...selection]);
            }
        }

        // set single card selection
        else {
            setSelection([index]);
        }
    }

    // add a card to the board
    function addCard(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50));
        setActualCards([...actualCards, card]);
        setIsDeckOpen(false);

        if (socket) {
            socket.emit('card-add', lobbyId, card);
        }
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
                onCardSelect={addCard}
                cardIds={cardsInDeck}
            />}

            <div id="board" className="flex-grow relative">
                <CardViewer
                    cards={displayedCards}
                    selection={selection}
                    onCardSelect={selectCard}
                />
            </div>

            <Interpolator
                targetState={actualCards}
                stepCount={5}
                stepDurationMs={5}
                onInterpolate={interpolateCardArray}
                onUpdate={setDisplayedCards}
            />
        </div>
    );
}
