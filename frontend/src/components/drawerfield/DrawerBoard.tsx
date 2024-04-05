import { MouseEvent, useState } from 'react';
import CardViewer from './CardViewer';
import Deck from './Deck';
import { CardTransform } from '../../data/CardTransform';
import { Vector2 } from '../../data/Vector2';
import { io } from 'socket.io-client';
import { images } from './imageImports';
import { Transform } from 'stream';

const pollFrequencyMs: number = 100;

export default function DrawerBoard() {
    let [cards, setCards] = useState([] as CardTransform[]);
    let [lastPoll, setLastPoll] = useState(Date.now());
    let [isDeckOpen, setIsDeckOpen] = useState(false);
    let [selectedIndex, setSelectedIndex] = useState(-1);
    //let socket = io()

    function sendUpdates() {
        const now: number = Date.now();
        const elapsed: number = now - lastPoll;

        if (elapsed >= pollFrequencyMs) {
            lastPoll = now;
            setLastPoll(lastPoll);

            //socket.emit('card-move', { index: selectedIndex, transform: cards[selectedIndex] });
        }
    }

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

        const boardWidth = window.innerWidth;
        const boardHeight = window.innerHeight;
        const cardWidth = 100;
        const cardHeight = 150;

        
        const cardLeft = cards[selectedIndex].position.x;
        const cardRight = cards[selectedIndex].position.x + cardWidth;
        const cardTop = cards[selectedIndex].position.y;
        const cardBottom = cards[selectedIndex].position.y + cardHeight;

        
        if (cardLeft < -50 || cardRight > boardWidth + 50 || cardTop < -80 || cardBottom > boardHeight + 80) {
            
            const updatedCards = cards.filter((_, index) => index !== selectedIndex);
            setCards(updatedCards);
            setSelectedIndex(-1);

            
            //socket.emit('card-remove', { index: selectedIndex });
        } else {
            
            setCards([...cards]);
            sendUpdates();
        }
    }

    function addCardFromDeck(id: number) {
        const card: CardTransform = new CardTransform(id, new Vector2(50, 50), 0, 1);

        setCards([...cards, card]);

        console.log(`add ${id}`);

        setIsDeckOpen(false);

        //socket.emit('card-add', {card: card});
    }

    const cardsInDeck: number[] = images.map((_, index) => index).filter(id => !cards.some(transform => transform.image === id));

    const findImageIndexBySrc = (src: any): number => {
        for (let i = 0; i < images.length; i++) {
            if (images[i] == src) {
                return i;
            }
        }
        return -1; // Ha nem találja meg a src-et, visszaadja -1-et
    };
    
    const transform_keres=(kep_index:Number):number=>{
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].image == kep_index) {
                return i;
            }
        }
        return -1;
    }
    
    

    const move = (event: MouseEvent) => {
        let divs = document.getElementsByClassName("Card");
        let asztal=document.getElementById("asztal")as HTMLElement;
        const widthInPixels =  asztal.offsetWidth;
        const heightInPixels =  asztal.offsetHeight;
        const { clientX, clientY } = event;
        for (let i = 0; i < divs.length; i++) {
            let card_dom = divs[i] as HTMLElement;
            
            if (card_dom.style.border != "none") {
                let uj_x=(clientX*100)/widthInPixels;
                let uj_y=(clientY*100)/heightInPixels;
                card_dom.style.left = `${uj_x}%`;
                card_dom.style.top = `${uj_y}%`;
               // card.style.border='none';

               let src = card_dom.getAttribute("src");
               let index=transform_keres(findImageIndexBySrc(src));
               if(index>-1){
                    cards[index].position=new Vector2(uj_x,uj_y);
                    setCards(cards);
               }
                
               
            }
        }
    };
    

    return (
        <div id="asztal" className="h-full flex justify-center items-center relative border-4 border-slate-700" onMouseMove={onMouseMove} onClick={move} >
            <span className="absolute text-gray-400 select-none text-3xl z-10">Drawer board</span>

            <div className="absolute z-30 top-0">
                <label className="swap text-xl text-gray-300 rounded-b-lg bg-slate-700 px-8 pb-1">
                    <input type="checkbox" checked={isDeckOpen} onChange={e => setIsDeckOpen(e.target.checked)} />
                    <div className="swap-on text-rose-300">Close deck</div>
                    <div className="swap-off text-green-300">Open deck</div>
                </label>
            </div>

            {isDeckOpen && <Deck onCardSelect={addCardFromDeck} cardIds={cardsInDeck} />}

            <CardViewer cards={cards} selectCallback={onCardSelect}  />
        </div>
    );
}
