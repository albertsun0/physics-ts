// import { Vec2 } from "./utils/vec2";

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

const Vec2Length = (a: Vec2) => {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}

class Renderer {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    constructor() {
        let canvas = document.getElementById('canvas') as
            HTMLCanvasElement;
        let context = canvas.getContext("2d");
        this.canvas = canvas;
        this.context = context;
    }

    public render(objects: VerletObject[]) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            const ctx = this.context;
            const r = obj.radius;
            ctx.beginPath();
            ctx.arc(obj.position_current.x - r, obj.position_current.y - r, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    }
}

class VerletObject {
    public position_current: Vec2;
    public position_old: Vec2;
    public acceleration: Vec2;
    public radius = 10;

    constructor(x = 0, y = 0, radius = -1) {
        this.position_current = new Vec2(x, y);
        this.position_old = new Vec2(x, y);
        this.acceleration = new Vec2();
        if (radius === -1) {
            this.radius = 20;
        }

    }

    public update(dt: number) {
        const velocity = this.position_current.sub(this.position_old);
        this.position_old = this.position_current;

        this.position_current = this.position_current.add(velocity).add(this.acceleration.mult(dt).mult(dt));
        this.acceleration = new Vec2();
    }

    public accelerate(acc: Vec2) {
        this.acceleration = this.acceleration.add(acc);
    }
}

class VertletSystem {
    public objects: VerletObject[] = [];
    public gravity: Vec2 = new Vec2(0, 1000);
    public dt: number = 1 / 60;
    public subSteps = 2;

    constructor(dt = 1 / 60) {
        this.dt = dt;
        this.objects.push(new VerletObject(600, 300));
    }

    public update() {
        for (let i = 0; i < this.subSteps; i++) {
            this.applyGravity();
            this.applyConstraint();
            this.updatePositions(this.dt / this.subSteps);
            this.checkCollisions();
        }
    }

    public addObject(x: number, y: number) {
        this.objects.push(new VerletObject(x, y));
    }

    public updatePositions(dt: number) {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.update(dt);
        }
    }

    public applyGravity() {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];
            obj.accelerate(this.gravity);
        }
    }

    public applyConstraint() {
        const position = new Vec2(500, 300);
        const radius = 200;

        for (let i = 0; i < this.objects.length; i++) {
            const diff = this.objects[i].position_current.sub(position);
            const dist = Vec2Length(diff);
            if (dist > radius - this.objects[i].radius) {
                const n = diff.mult(1 / dist);
                this.objects[i].position_current = position.add(n.mult(radius - this.objects[i].radius));
            }
        }
    }

    public checkCollisions() {
        for (let i = 0; i < this.objects.length; i++) {
            const obj1 = this.objects[i];
            for (let j = i + 1; j < this.objects.length; j++) {
                const obj2 = this.objects[j];
                const diff = obj1.position_current.sub(obj2.position_current);
                const dist = Vec2Length(diff);
                const minDist = obj1.radius + obj2.radius;
                if (dist < minDist) {
                    const n = diff.mult(1 / dist);
                    const delta = minDist - dist;
                    obj1.position_current = obj1.position_current.add(n.mult(0.5 * delta));
                    obj2.position_current = obj2.position_current.sub(n.mult(0.5 * delta));
                }
            }
        }
    }
}

const fps = 60

const system = new VertletSystem(1 / fps);

const renderer = new Renderer();

renderer.canvas.addEventListener('click', (e) => {
    system.addObject(e.offsetX, e.offsetY);
})
function update() {
    system.update();
    renderer.render(system.objects);
}

update();

setInterval(update, 1000 / fps);