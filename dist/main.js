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
    Renderer.prototype.render = function (objects) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var ctx = this.context;
            var r = obj.radius;
            ctx.beginPath();
            ctx.arc(obj.position_current.x - r, obj.position_current.y - r, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    };
    return Renderer;
}());
var VerletObject = /** @class */ (function () {
    function VerletObject(x, y, radius) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (radius === void 0) { radius = -1; }
        this.radius = 10;
        this.position_current = new Vec2(x, y);
        this.position_old = new Vec2(x, y);
        this.acceleration = new Vec2();
        if (radius === -1) {
            this.radius = 20;
        }
    }
    VerletObject.prototype.update = function (dt) {
        var velocity = this.position_current.sub(this.position_old);
        this.position_old = this.position_current;
        this.position_current = this.position_current.add(velocity).add(this.acceleration.mult(dt).mult(dt));
        this.acceleration = new Vec2();
    };
    VerletObject.prototype.accelerate = function (acc) {
        this.acceleration = this.acceleration.add(acc);
    };
    return VerletObject;
}());
var VertletSystem = /** @class */ (function () {
    function VertletSystem(dt) {
        if (dt === void 0) { dt = 1 / 60; }
        this.objects = [];
        this.gravity = new Vec2(0, 1000);
        this.dt = 1 / 60;
        this.subSteps = 2;
        this.dt = dt;
        this.objects.push(new VerletObject(600, 300));
    }
    VertletSystem.prototype.update = function () {
        for (var i = 0; i < this.subSteps; i++) {
            this.applyGravity();
            this.applyConstraint();
            this.updatePositions(this.dt / this.subSteps);
            this.checkCollisions();
        }
    };
    VertletSystem.prototype.addObject = function (x, y) {
        this.objects.push(new VerletObject(x, y));
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
    VertletSystem.prototype.applyConstraint = function () {
        var position = new Vec2(500, 300);
        var radius = 200;
        for (var i = 0; i < this.objects.length; i++) {
            var diff = this.objects[i].position_current.sub(position);
            var dist = Vec2Length(diff);
            if (dist > radius - this.objects[i].radius) {
                var n = diff.mult(1 / dist);
                this.objects[i].position_current = position.add(n.mult(radius - this.objects[i].radius));
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
                    obj1.position_current = obj1.position_current.add(n.mult(0.5 * delta));
                    obj2.position_current = obj2.position_current.sub(n.mult(0.5 * delta));
                }
            }
        }
    };
    return VertletSystem;
}());
var fps = 60;
var system = new VertletSystem(1 / fps);
var renderer = new Renderer();
renderer.canvas.addEventListener('click', function (e) {
    system.addObject(e.offsetX, e.offsetY);
});
function update() {
    system.update();
    renderer.render(system.objects);
}
update();
setInterval(update, 1000 / fps);
//# sourceMappingURL=main.js.map