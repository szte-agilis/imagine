import Card from './Card';
import { CardTransform } from '../../data/CardTransform';

export const ASPECT_RATIO: number = 16.0 / 9.0;

export default function CardViewer({ cards, selectedIndexes = [], selectCallback }: { cards: CardTransform[], selectedIndexes?: number[], selectCallback?: (i: number) => void }) {
    if(cards !== undefined){
    return (
        <div className="relative bg-gray-800 overflow-hidden" style={{aspectRatio: ASPECT_RATIO}}>
                {cards.map((transform, index) => {
                return (
                    <Card key={index} transform={transform} isSelected={selectedIndexes.includes(index)} selectCallback={() => selectCallback === undefined ? undefined : selectCallback(index)}/>
                );
            })}
        </div>
    );
}else{
    return null;
}
}

