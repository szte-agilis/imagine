import Vector2 from "./Vector2";
import CardTransform from "./CardTransform";
import {BOARD_ASPECT_RATIO} from "../components/drawerfield/CardViewer";

export abstract class UpdateMessage {
    readonly timestamp: number;

    protected constructor(timestamp: number){
        this.timestamp = timestamp;
    }

    abstract apply(cards: CardTransform[]): CardTransform[];
}

export class AddMessage extends UpdateMessage {
    readonly id: number;

    constructor(timestamp: number, id: number){
        super(timestamp);
        this.id = id;
    }

    apply(cards: CardTransform[]): CardTransform[] {
        const card: CardTransform = new CardTransform(this.id, new Vector2(50, 50));

        return cards.concat(card);
    }
}

export class RemoveMessage extends UpdateMessage {
    readonly selection: number[];

    constructor(timestamp: number, selection: number[]){
        super(timestamp);
        this.selection = selection;
    }

    apply(cards: CardTransform[]): CardTransform[] {
        return cards.filter(card => !this.selection.includes(card.id));
    }
}

export class RotateMessage extends UpdateMessage {
    readonly selection: number[];
    readonly angle: number;

    constructor(timestamp: number, selection: number[], angle: number){
        super(timestamp);
        this.selection = selection;
        this.angle = angle;
    }

    apply(cards: CardTransform[]): CardTransform[] {
        // copy the array
        const results: CardTransform[] = cards.slice();

        if (this.selection.length === 0) {
            return results;
        }

        const center: Vector2 = getSelectionCenter(results, this.selection);

        const angleRad: number = this.angle * Math.PI / 180.0;
        const cosTheta: number = Math.cos(angleRad);
        const sinTheta: number = Math.sin(angleRad);

        this.selection.forEach(i => {
            const card: CardTransform = results[i];
            const posX: number = card.position.x
            const posY: number = card.position.y

            // normalize x coordinate by aspect ratio
            const normalizedX = posX * BOARD_ASPECT_RATIO;
            const normalizedY = posY;

            // calculate normalized pivot
            const normalizedPivotX = center.x * BOARD_ASPECT_RATIO;
            const normalizedPivotY = center.y;

            // translate to origin based on normalized pivot
            const translatedX = normalizedX - normalizedPivotX;
            const translatedY = normalizedY - normalizedPivotY;

            // rotate
            const rotatedX = cosTheta * translatedX - sinTheta * translatedY;
            const rotatedY = sinTheta * translatedX + cosTheta * translatedY;

            // translate back and convert back to percentage coordinates
            const newX = (rotatedX + normalizedPivotX) / BOARD_ASPECT_RATIO; // De-normalize x coordinate
            const newY = rotatedY + normalizedPivotY;

            card.position.x = newX;
            card.position.y = newY;

            card.rotation = results[i].rotation + this.angle;
        })

        return results;
    }
}

export class ScaleMessage extends UpdateMessage {
    readonly selection: number[];
    readonly scale: number;

    constructor(timestamp: number, selection: number[], scale: number){
        super(timestamp);
        this.selection = selection;
        this.scale = scale;
    }

    apply(cards: CardTransform[]): CardTransform[] {
        // copy the array
        const results: CardTransform[] = cards.slice();

        if (this.selection.length === 0) {
            return results;
        }

        let scalingFactor: number = this.scale;

        this.selection.forEach(i => {
            if (i < 0 || i >= results.length) {
                return;
            }

            let scale = results[i].scale * this.scale;

            scale = Math.min(0.9, Math.max(0.1, scale));


            let actualSize = scale / results[i].scale;

            if (this.scale < 1) {
                scalingFactor = Math.max(scalingFactor, actualSize);
            }
            else {
                scalingFactor = Math.min(scalingFactor, actualSize);
            }
        })

        const pivotPos: Vector2 = getSelectionCenter(results, this.selection);

        this.selection.forEach(index => {
            if (index < 0 || index >= results.length) {
                return;
            }

            results[index].scale *= scalingFactor;

            // subtraction of card position and center
            let cardPivotDifference: Vector2 = Vector2.sub(results[index].position, pivotPos);

            // card and center difference change
            cardPivotDifference = Vector2.mul(cardPivotDifference, scalingFactor);

            // set card new shifted position
            results[index].position = Vector2.add(pivotPos, cardPivotDifference);

        });

        return results;
    }
}

export class MoveMessage extends UpdateMessage {
    readonly selection: number[];
    readonly vector: Vector2;

    constructor(timestamp: number, selection: number[], vector: Vector2){
        super(timestamp);
        this.selection = selection;
        this.vector = vector;
    }

    apply(cards: CardTransform[]): CardTransform[] {
        // copy the array
        const results: CardTransform[] = cards.slice();

        // no cards to move
        if (this.selection.length === 0) {
            return results;
        }

        // modify the position of all selected cards
        this.selection.forEach(i => {
            const position: Vector2 = results[i].position;

            position.x += this.vector.x;
            position.y += this.vector.y;
        })

        return results;
    }
}

export class ResetMessage extends UpdateMessage {
    constructor(timestamp: number, ){
        super(timestamp);
    }

    apply(_: CardTransform[]): CardTransform[] {
        return [];
    }
}

// get the center of a card selection
function getSelectionCenter(cards: CardTransform[], selection: number[]): Vector2 {
    const selectedCards: CardTransform[] = selection.map(index => cards[index]);

    const posX: number[] = selectedCards.map(a => a.position.x)
    const posY: number[] = selectedCards.map(b => b.position.y)

    const minX: number = Math.min(...posX);
    const minY: number = Math.min(...posY);
    const maxX: number = Math.max(...posX);
    const maxY: number = Math.max(...posY);

    return new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
}