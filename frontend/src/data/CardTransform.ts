import { Vector2 } from './Vector2';

export class CardTransform {
    image: number;
    position: Vector2;
    rotation: number;
    scale: number;

    constructor(image = 0, position: Vector2 = new Vector2(), rotation: number = 0, scale: number = 1) {
        this.image = image;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}

