import Card from './Card';
import { CardTransform } from '../../data/CardTransform';

export default function CardViewer({ cards }: { cards: CardTransform[] }) {

    const cardList = cards.map((transform, i) => {
        return (
            <Card
                key={i}
                transform={transform}
                selectCallback={() => {
                }}
            />
        );
    });

    return (
        <div className="size-full relative bg-slate-200">
            {cards.map((transform, i) => {
                return (
                    <Card key={i} transform={transform} />
                );
            })}
        </div>
    );
}
