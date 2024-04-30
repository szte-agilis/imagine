export default class Vector2{
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    static add (a:Vector2, b:Vector2) {
        return new Vector2(a.x+b.x, a.y+b.y);
    }

    static sub (a:Vector2, b:Vector2) {
        return new Vector2(a.x-b.x, a.y-b.y);
    }

    static mul (a: Vector2, b:number){
        return new Vector2(a.x*b, a.y*b);
    }
}
