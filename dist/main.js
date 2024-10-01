"use strict";
// import { Vec2 } from "./utils/vec2";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec2 = void 0;
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.set = function (x, y) {
        return new Vec2(x, y);
    };
    Vec2.prototype.add = function (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    };
    Vec2.prototype.sub = function (v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    };
    Vec2.prototype.mult = function (x) {
        return new Vec2(this.x * x, this.y * x);
    };
    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };
    return Vec2;
}());
exports.Vec2 = Vec2;
var Vec2Length = function (a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
};
var Renderer = /** @class */ (function () {
    function Renderer() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext("2d");
        this.canvas = canvas;
        this.context = context;
    }
    Renderer.prototype.render = function (objects, links) {
        if (links === void 0) { links = []; }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var ctx = this.context;
            ctx.beginPath();
            ctx.moveTo(link.a.position_current.x, link.a.position_current.y);
            ctx.lineTo(link.b.position_current.x, link.b.position_current.y);
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var ctx = this.context;
            var r = obj.radius;
            ctx.beginPath();
            ctx.arc(obj.position_current.x, obj.position_current.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'gray';
            if (obj.fixed) {
                ctx.fillStyle = 'red';
            }
            ctx.fill();
        }
    };
    return Renderer;
}());
var VerletObject = /** @class */ (function () {
    function VerletObject(x, y, radius, fixed) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (radius === void 0) { radius = -1; }
        if (fixed === void 0) { fixed = false; }
        this.radius = 10;
        this.position_current = new Vec2(x, y);
        this.position_old = new Vec2(x, y);
        this.acceleration = new Vec2();
        if (radius === -1) {
            this.radius = Math.random() * 10 + 10;
        }
        this.fixed = fixed;
    }
    VerletObject.prototype.update = function (dt) {
        if (this.fixed)
            return;
        var velocity = this.position_current.sub(this.position_old);
        this.position_old = this.position_current;
        this.position_current = this.position_current.add(velocity).add(this.acceleration.mult(dt).mult(dt));
        this.acceleration = new Vec2();
    };
    VerletObject.prototype.accelerate = function (acc) {
        if (this.fixed)
            return;
        this.acceleration = this.acceleration.add(acc);
    };
    return VerletObject;
}());
var Link = /** @class */ (function () {
    function Link(a, b, width) {
        if (width === void 0) { width = 100; }
        this.a = a;
        this.b = b;
        if (width === -1) {
            this.width = Vec2Length(a.position_current.sub(b.position_current));
        }
        else {
            this.width = width;
        }
    }
    Link.prototype.update = function () {
        var diff = this.a.position_current.sub(this.b.position_current);
        var dist = Vec2Length(diff);
        var n = diff.mult(1 / dist);
        var delta = this.width - dist;
        if (!this.a.fixed) {
            this.a.position_current = this.a.position_current.add(n.mult(delta / 2));
        }
        if (!this.b.fixed) {
            this.b.position_current = this.b.position_current.sub(n.mult(delta / 2));
        }
    };
    return Link;
}());
var VertletSystem = /** @class */ (function () {
    function VertletSystem(width, height, dt) {
        if (dt === void 0) { dt = 1 / 60; }
        this.objects = [];
        this.links = [];
        this.gravity = new Vec2(0, 1000);
        this.dt = 1 / 60;
        this.subSteps = 2;
        this.dt = dt;
        this.width = width;
        this.height = height;
        // this.objects.push(new VerletObject(600, 300));
    }
    VertletSystem.prototype.update = function () {
        for (var i = 0; i < this.subSteps; i++) {
            this.applyGravity();
            this.applyConstraint();
            this.updatePositions(this.dt / this.subSteps);
            this.checkCollisions();
            for (var i_1 = 0; i_1 < this.links.length; i_1++) {
                this.links[i_1].update();
            }
        }
    };
    VertletSystem.prototype.addObject = function (o) {
        this.objects.push(o);
    };
    VertletSystem.prototype.addLink = function (l) {
        this.links.push(l);
    };
    VertletSystem.prototype.updatePositions = function (dt) {
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.update(dt);
        }
    };
    VertletSystem.prototype.applyGravity = function () {
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.accelerate(this.gravity);
        }
    };
    VertletSystem.prototype.applyConstraintCircle = function () {
        var position = new Vec2(500, 300);
        var radius = 300;
        for (var i = 0; i < this.objects.length; i++) {
            var diff = this.objects[i].position_current.sub(position);
            var dist = Vec2Length(diff);
            if (dist > radius - this.objects[i].radius) {
                var n = diff.mult(1 / dist);
                this.objects[i].position_current = position.add(n.mult(radius - this.objects[i].radius));
            }
        }
    };
    VertletSystem.prototype.applyConstraint = function () {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].fixed)
                continue;
            var object = this.objects[i];
            if (object.position_current.y > this.height - object.radius) {
                var diff = object.position_current.y - (this.height - object.radius);
                var u = new Vec2(0, -1);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
            if (object.position_current.y < 0 + object.radius) {
                var diff = object.radius - object.position_current.y;
                var u = new Vec2(0, 1);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
            if (object.position_current.x > this.width - object.radius) {
                var diff = object.position_current.x - (this.width - object.radius);
                var u = new Vec2(-1, 0);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
            if (object.position_current.x < 0 + object.radius) {
                var diff = object.radius - object.position_current.x;
                var u = new Vec2(1, 0);
                object.position_current = object.position_current.add(u.mult(diff * 0.5));
            }
        }
    };
    VertletSystem.prototype.checkCollisions = function () {
        for (var i = 0; i < this.objects.length; i++) {
            var obj1 = this.objects[i];
            for (var j = i + 1; j < this.objects.length; j++) {
                var obj2 = this.objects[j];
                var diff = obj1.position_current.sub(obj2.position_current);
                var dist = Vec2Length(diff);
                var minDist = obj1.radius + obj2.radius;
                if (dist < minDist) {
                    var n = diff.mult(1 / dist);
                    var delta = minDist - dist;
                    obj1.position_current = obj1.position_current.add(n.mult(0.5 * delta).mult(0.99));
                    obj2.position_current = obj2.position_current.sub(n.mult(0.5 * delta).mult(0.99));
                }
            }
        }
    };
    return VertletSystem;
}());
var SimulationPaused = false;
var pause = function () {
    SimulationPaused = !SimulationPaused;
    if (SimulationPaused) {
        document.getElementById("pause").innerHTML = "Resume";
    }
    else {
        document.getElementById("pause").innerHTML = "Pause";
    }
};
var fps = 60;
var renderer = new Renderer();
var w = window.innerWidth;
var h = window.innerHeight;
renderer.canvas.width = w;
renderer.canvas.height = h;
var system = new VertletSystem(w, h, 1 / fps);
var a = new VerletObject(300, 300);
var b = new VerletObject(300, 400);
var link1 = new Link(a, b);
system.addObject(a);
system.addObject(b);
system.addLink(link1);
var addLine = function () {
    var prevObject = null;
    var y = 100;
    for (var i = 200; i < 900; i += 100) {
        var obj = new VerletObject(i, y);
        system.addObject(obj);
        if (prevObject) {
            var link = new Link(prevObject, obj);
            system.addLink(link);
        }
        prevObject = obj;
    }
    prevObject.fixed = true;
};
var add100 = function () {
    for (var i = 0; i < 100; i++) {
        var obj = new VerletObject(300 + i, 300);
        system.addObject(obj);
    }
};
var prevObject = null;
renderer.canvas.addEventListener('click', function (e) {
    console.log("click");
    // check if clicked an object
    for (var i = 0; i < system.objects.length; i++) {
        var obj_1 = system.objects[i];
        var diff = obj_1.position_current.sub(new Vec2(e.offsetX, e.offsetY));
        var dist = Vec2Length(diff);
        if (dist < obj_1.radius) {
            obj_1.fixed = !obj_1.fixed;
            return;
        }
    }
    var obj = new VerletObject(e.offsetX, e.offsetY);
    system.addObject(obj);
    prevObject = null;
});
renderer.canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    console.log("contextmenu");
    for (var i = 0; i < system.objects.length; i++) {
        var obj = system.objects[i];
        var diff = obj.position_current.sub(new Vec2(e.offsetX, e.offsetY));
        var dist = Vec2Length(diff);
        if (dist < obj.radius) {
            if (prevObject) {
                var newLink = new Link(prevObject, obj, -1);
                system.addLink(newLink);
                prevObject = obj;
                return;
            }
            prevObject = obj;
            return;
        }
    }
    if (prevObject) {
        var newObject_1 = new VerletObject(e.offsetX, e.offsetY);
        var newLink = new Link(prevObject, newObject_1, -1);
        system.addObject(newObject_1);
        system.addLink(newLink);
        prevObject = newObject_1;
        return;
    }
    var newObject = new VerletObject(e.offsetX, e.offsetY);
    system.addObject(newObject);
    prevObject = newObject;
});
function update() {
    console.log("num objects", system.objects.length);
    renderer.render(system.objects, system.links);
    if (!SimulationPaused) {
        system.update();
    }
}
update();
setInterval(update, 1000 / fps);
//# sourceMappingURL=main.js.map