import Card from './Card';
import { CardTransform } from '../../data/CardTransform';

export default function CardViewer({ cards, selectedIndexes = [], selectCallback }: { cards: CardTransform[], selectedIndexes?: number[], selectCallback?: (i: number) => void }) {
    return (
        <div className="size-full relative bg-gray-800">
            {cards.map((transform, index) => {
                return (
                    <Card key={index} transform={transform} isSelected={selectedIndexes.includes(index)} selectCallback={() => selectCallback === undefined ? undefined : selectCallback(index)}/>
                );
            })}
        </div>
    );
}
