import Vector2 from './Vector2';

export default class CardTransform {
    id: number;
    position: Vector2;
    rotation: number;
    scale: number;

    constructor(id: number, position: Vector2, rotation: number = 0, scale: number = 0.33) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}