import CardTransform from "../../data/CardTransform";
import Card from "./Card";


export const BOARD_ASPECT_RATIO: number = 16.0 / 9.0;

const findGroupIndex = (array: number[][], id: number): number  => {
    for (let i = 0; i < array.length; i++) {
      const subArray = array[i];
      if (subArray.includes(id)) {
        return i; // Visszaadjuk a tömb indexét, amelyben megtaláltuk az azonosítót
      }
    }
    return -1; // Ha az azonosítót nem találjuk meg egyik tömbben sem
  };

export default function CardViewer(
    {
        cards,
        groups=[],
        selection = [],
        onCardSelect = (_: number) => {}
    }: {
        cards: CardTransform[],
        groups?:number[][],
        selection?: number[],
        onCardSelect?: (i: number) => void
    }) {

    return (
        <div className="relative bg-gray-800 overflow-hidden" id="board" style={{aspectRatio: BOARD_ASPECT_RATIO}}>
            {cards.map((transform, index) => {
                     let g=findGroupIndex(groups,index)+1;
             return (
                 <Card key={index} transform={transform} group={g} isSelected={selection.includes(index)} selectCallback={() => onCardSelect(index)} />
             );
            })}
        </div>
    );
}