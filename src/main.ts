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

    public render(objects: VerletObject[], links: Link[] = []) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const ctx = this.context;
            ctx.beginPath();
            ctx.moveTo(link.a.position_current.x, link.a.position_current.y);
            ctx.lineTo(link.b.position_current.x, link.b.position_current.y);
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            const ctx = this.context;
            const r = obj.radius;
            ctx.beginPath();
            ctx.arc(obj.position_current.x, obj.position_current.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'gray';
            if (obj.fixed) {
                ctx.fillStyle = 'red';
            }
            ctx.fill();
        }
    }
}

class VerletObject {
    public position_current: Vec2;
    public position_old: Vec2;
    public acceleration: Vec2;
    public radius = 10;
    public fixed;

    constructor(x = 0, y = 0, radius = -1, fixed = false) {
        this.position_current = new Vec2(x, y);
        this.position_old = new Vec2(x, y);
        this.acceleration = new Vec2();
        if (radius === -1) {
            this.radius = Math.random() * 10 + 10;
        }
        this.fixed = fixed;
    }

    public update(dt: number) {
        if (this.fixed) return;
        const velocity = this.position_current.sub(this.position_old);
        this.position_old = this.position_current;

        this.position_current = this.position_current.add(velocity).add(this.acceleration.mult(dt).mult(dt));
        this.acceleration = new Vec2();
    }

    public accelerate(acc: Vec2) {
        if (this.fixed) return;
        this.acceleration = this.acceleration.add(acc);
    }
}

class Link {
    public a: VerletObject;
    public b: VerletObject;
    public width;
    constructor(a: VerletObject, b: VerletObject, width = 100) {
        this.a = a;
        this.b = b;
        if (width === -1) {
            this.width = Vec2Length(a.position_current.sub(b.position_current));
        }
        else {
            this.width = width
        }
    }

    public update() {
        const diff = this.a.position_current.sub(this.b.position_current);
        const dist = Vec2Length(diff);
        const n = diff.mult(1 / dist);
        const delta = this.width - dist;
        if (!this.a.fixed) {
            this.a.position_current = this.a.position_current.add(n.mult(delta / 2));
        }
        if (!this.b.fixed) {
            this.b.position_current = this.b.position_current.sub(n.mult(delta / 2));
        }
    }
}

class VertletSystem {
    public objects: VerletObject[] = [];
    public links: Link[] = [];
    public gravity: Vec2 = new Vec2(0, 1000);
    public dt: number = 1 / 60;
    public subSteps = 2;
    public width;
    public height;

    constructor(width, height, dt = 1 / 60) {
        this.dt = dt;
        this.width = width;
        this.height = height;
        // this.objects.push(new VerletObject(600, 300));
    }

    public update() {
        for (let i = 0; i < this.subSteps; i++) {
            this.applyGravity();
            this.applyConstraint();
            this.updatePositions(this.dt / this.subSteps);
            this.checkCollisions();
            for (let i = 0; i < this.links.length; i++) {
                this.links[i].update();
            }
        }

    }

    public addObject(o: VerletObject) {
        this.objects.push(o);
    }

    public addLink(l: Link) {
        this.links.push(l);
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

    public applyConstraintCircle() {
        const position = new Vec2(500, 300);
        const radius = 300;

        for (let i = 0; i < this.objects.length; i++) {
            const diff = this.objects[i].position_current.sub(position);
            const dist = Vec2Length(diff);
            if (dist > radius - this.objects[i].radius) {
                const n = diff.mult(1 / dist);
                this.objects[i].position_current = position.add(n.mult(radius - this.objects[i].radius));
            }
        }
    }

    public applyConstraint() {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].fixed) continue;
            const object = this.objects[i]
            if (object.position_current.y > this.height - object.radius) {
                const diff = object.position_current.y - (this.height - object.radius);
                const u = new Vec2(0, -1);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
            if (object.position_current.y < 0 + object.radius) {
                const diff = object.radius - object.position_current.y;
                const u = new Vec2(0, 1);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
            if (object.position_current.x > this.width - object.radius) {
                const diff = object.position_current.x - (this.width - object.radius);
                const u = new Vec2(-1, 0);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
            if (object.position_current.x < 0 + object.radius) {
                const diff = object.radius - object.position_current.x;
                const u = new Vec2(1, 0);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
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
                    obj1.position_current = obj1.position_current.add(n.mult(0.5 * delta).mult(0.99));
                    obj2.position_current = obj2.position_current.sub(n.mult(0.5 * delta).mult(0.99));
                }
            }
        }
    }
}

var SimulationPaused = false;

const pause = () => {
    SimulationPaused = !SimulationPaused;

    if (SimulationPaused) {
        document.getElementById("pause").innerHTML = "Resume";
    } else {
        document.getElementById("pause").innerHTML = "Pause";
    }
}

const fps = 60

const renderer = new Renderer();

const w = window.innerWidth;
const h = window.innerHeight;

renderer.canvas.width = w;
renderer.canvas.height = h;

const system = new VertletSystem(w, h, 1 / fps);

const a = new VerletObject(300, 300);
const b = new VerletObject(300, 400);

const link1 = new Link(a, b);

system.addObject(a);
system.addObject(b);
system.addLink(link1);

const addLine = () => {
    let prevObject = null;
    const y = 100
    for (let i = 200; i < 900; i += 100) {
        const obj = new VerletObject(i, y);
        system.addObject(obj);
        if (prevObject) {
            const link = new Link(prevObject, obj);
            system.addLink(link);
        }
        prevObject = obj;
    }
    prevObject.fixed = true;
}

const add100 = () => {
    for (let i = 0; i < 100; i++) {
        const obj = new VerletObject(300 + i, 300);
        system.addObject(obj);
    }
}


var prevObject = null;

renderer.canvas.addEventListener('click', (e) => {
    console.log("click")
    // check if clicked an object
    for (let i = 0; i < system.objects.length; i++) {
        const obj = system.objects[i];
        const diff = obj.position_current.sub(new Vec2(e.offsetX, e.offsetY));
        const dist = Vec2Length(diff);
        if (dist < obj.radius) {
            obj.fixed = !obj.fixed;
            return;
        }
    }

    const obj = new VerletObject(e.offsetX, e.offsetY);
    system.addObject(obj);
    prevObject = null;

})

renderer.canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log("contextmenu")

    for (let i = 0; i < system.objects.length; i++) {
        const obj = system.objects[i];
        const diff = obj.position_current.sub(new Vec2(e.offsetX, e.offsetY));
        const dist = Vec2Length(diff);
        if (dist < obj.radius) {
            if (prevObject) {
                const newLink = new Link(prevObject, obj, -1);
                system.addLink(newLink);
                prevObject = obj;
                return;
            }
            prevObject = obj;
            return;
        }
    }

    if (prevObject) {
        const newObject = new VerletObject(e.offsetX, e.offsetY);
        const newLink = new Link(prevObject, newObject, -1);
        system.addObject(newObject);
        system.addLink(newLink);
        prevObject = newObject;
        return;
    }

    const newObject = new VerletObject(e.offsetX, e.offsetY);
    system.addObject(newObject);
    prevObject = newObject;

})

function update() {
    console.log("num objects", system.objects.length)
    renderer.render(system.objects, system.links);
    if (!SimulationPaused) {
        system.update();
    }
}

update();

setInterval(update, 1000 / fps);