import { Vector2 } from './Vector2';

export class CardTransform {
    id: number;
    position: Vector2;
    rotation: number;
    scale: number;
    size:number

    constructor(id: number, position: Vector2, rotation: number = 0, scale: number = 1,size:number=25) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.size=size;
    }
}

