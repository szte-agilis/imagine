import { Vector2 } from './Vector2';

export class CardTransform {
    position: Vector2;
    rotation: number;
    scale: number;

    constructor(position: Vector2 = new Vector2(), rotation: number = 0, scale: number = 1) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}

