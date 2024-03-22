import Card from './Card';
import { CardTransform } from '../../data/CardTransform';
import { MouseEventHandler } from 'react';

export default function CardViewer({ cards, selectCallback }: { cards: CardTransform[], selectCallback?: (i: number) => void }) {
    return (
        <div className="size-full relative bg-slate-200">
            {cards.map((transform, index) => {
                return (
                    <Card key={index} transform={transform} selectCallback={() => selectCallback === undefined ? undefined : selectCallback(index)}/>
                );
            })}
        </div>
    );
}
