export class CardPosition{
    position: Vector2;
    rotation: number;
    scale: number;

    constructor(position: Vector2, rotation: number, scale: number) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}

export class Vector2{
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
