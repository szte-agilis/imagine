import { Vector2 } from './Vector2';

export class CardTransform {
    id: number;
    position: Vector2;
    rotation: number;
    scale: number;

    constructor(id: number, position: Vector2, rotation: number = 0, scale: number = 1) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}

