import CardViewer from './CardViewer';
import {useEffect, useState} from 'react';
import { CardTransform } from '../../data/CardTransform';
import {Socket} from 'socket.io-client';

export default function GuesserBoard({socket}: {socket: Socket | null}) {
    let [cards, setCards] = useState([] as CardTransform[]);

    useEffect(() => {
        if(socket){
            socket.on('card-add', function(card: CardTransform){
                cards.push(card);
                setCards([...cards]);
            })

            socket.on('card-modify', function(i: number, card: CardTransform) {
                cards[i] = card;
                setCards([...cards]);
            });

            socket.on('card-remove', function(i: number) {
                cards.splice(i, 1);
                setCards([...cards]);
            });

            socket.on('reset', function() {
                cards = [];
                setCards([...cards]);
            });
        }

        return () => {
            if(socket){
                socket.off('card-add');
                socket.off('card-modify');
                socket.off('card-remove');
                socket.off('reset');
            }
        }
    }, [socket]);

    return (
        <div className="h-full flex flex-col relative border-4 border-t-0 border-sky-700">
            <div className="flex justify-center w-full h-8 bg-sky-700 min-h-8"></div>

            <CardViewer cards={cards}/>
        </div>
    );
}