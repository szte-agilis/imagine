import CardTransform from "../../data/CardTransform";
import Card from "./Card";
import cardGroups from "../../data/CardGrups";

export const BOARD_ASPECT_RATIO: number = 16.0 / 9.0;

export default function CardViewer(
    {
        cards,
        groups,
        selection = [],
        onCardSelect = (_: number) => {}
    }: {
        cards: CardTransform[],
        groups:cardGroups[],
        selection?: number[],
        onCardSelect?: (i: number) => void
    }) {

    return (
        <div className="relative bg-gray-800 overflow-hidden" id="board" style={{aspectRatio: BOARD_ASPECT_RATIO}}>
            {cards.map((transform, index) => {
             // Ellenőrizzük, hogy van-e csoport az adott kártyához
             const existingGroup = groups.find(group => group.tag(index) );
             // Ha találunk egy már létező csoportot, adjuk azt át
             const group = existingGroup || new cardGroups(index);
             return (
                 <Card key={index} transform={transform} group={group} isSelected={selection.includes(index)} selectCallback={() => onCardSelect(index)} />
             );
            })}
        </div>
    );
}