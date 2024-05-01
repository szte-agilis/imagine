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
    // the state of the card array
    const [actualCards, setActualCards] = useState([] as CardTransform[]);

    // the displayed state of the card array
    const [displayedCards, setDisplayedCards] = useState([] as CardTransform[]);

    // the indexes of the cards in the current selection
    const [selection, setSelection] = useState([] as number[]);

    // the time of the last card movement update
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // is the deck currently open
    const [isDeckOpen, setIsDeckOpen] = useState(false);

    // is the left control key pressed
    const [isCtrlDown, setIsCtrlDown] = useState(false);

    // is the left mouse button is pressed
    const [isMouseDown, setIsMouseDown] = useState(false);

    // the board as an HTML element
    const board: HTMLElement = document.getElementById("board") as HTMLElement;

    // the array of cards in the deck (all the cards currently not placed on the board)
    const cardsInDeck: number[] = cardImages.map((_, index) => index).filter(id => !actualCards.some(transform => transform.id === id));

    // handle keyboard and mouse events
    useEffect(() => {
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('mousemove', onMouseMove);

        // must remove event listeners so they are not added multiple times
        return () => {
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('mousemove', onMouseMove);
        }
    });

    // handle mouse down event
    function onMouseDown(e: MouseEvent) {
        // left mouse button is pressed
        if (e.button === 0) {
            setIsMouseDown(true);
        }
    }

    // handle mouse up event
    function onMouseUp(e: MouseEvent) {
        // left mouse button released
        if (e.button === 0) {
            setIsMouseDown(false);
        }

        // no cards are selected, do nothing
        if (selection.length === 0) {
            return;
        }

        // do not reset selection when ctrl is pressed
        if (isCtrlDown) {
            // still stream updates so the board looks the same for everyone
            sendUpdates(true);

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
        sendUpdates(true);
    }

    // handle key down events
    function onKeyDown(e: KeyboardEvent) {
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
    function onKeyUp(e: KeyboardEvent) {
        // left control key is released
        if (e.key === 'Control') {
            setIsCtrlDown(false);
        }
    }

    // handle mouse movement
    function onMouseMove(e: MouseEvent) {
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
    function handleAdd(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50));

        setActualCards([...actualCards, card]);
        setIsDeckOpen(false);

        if (socket) {
            socket.emit('card-add', lobbyId, card);
        }
    }

    // move the selected cards
    function handleMove(x: number, y: number) {
        // move the selected cards
        moveSelection(actualCards, selection, new Vector2(x, y), new Vector2(board.offsetWidth, board.offsetHeight));

        // stream updates
        sendUpdates();

        // update cards
        setActualCards([...actualCards]);
    }

    // rotate the selected cards
    function handleRotate(direction: number) {
        // rotation amount in degrees
        const amountDeg = 15 * direction;

        // rotate the selection
        rotateSelection(actualCards, selection, amountDeg);

        // stream updates
        sendUpdates();

        // update cards
        setActualCards([...actualCards]);
    }

    // scale the selected cards
    function handleScale(amount: number) {
        // scale the selection
        scaleSelection(actualCards, selection, amount);

        // stream updates
        sendUpdates();

        setActualCards([...actualCards]);
    }

    // select a card
    function selectCard(index: number) {
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

    // send updates to the lobby
    function sendUpdates(force: boolean = false) {
        // calculate elapsed time since last update
        const now: number = Date.now();
        const elapsed: number = now - lastUpdate;

        // update the cards if enough time has passed
        if (force || elapsed >= updateFrequencyMs) {
            setLastUpdate(now);

            if (socket) {
                socket.emit('card-modify', lobbyId, actualCards);
            }
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
                onCardSelect={handleAdd}
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
