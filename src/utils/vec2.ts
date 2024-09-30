export class Vec2 {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number) {
        return new Vec2(x, y);
    }

    public add(v: Vec2) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    public sub(v: Vec2) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    public mult(x: number) {
        return new Vec2(this.x * x, this.y * x);
    }

    public clone() {
        return new Vec2(this.x, this.y);
    }
}