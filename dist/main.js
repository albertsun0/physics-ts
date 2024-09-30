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
            var width = obj.width;
            ctx.beginPath();
            ctx.arc(obj.position_current.x - width / 2, obj.position_current.y - width / 2, width, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    };
    return Renderer;
}());
var VerletObject = /** @class */ (function () {
    function VerletObject(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.width = 20;
        this.position_current = new Vec2(x, y);
        this.position_old = new Vec2(x, y);
        this.acceleration = new Vec2();
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
        this.dt = dt;
        this.objects.push(new VerletObject(600, 300));
    }
    VertletSystem.prototype.update = function () {
        this.applyGravity();
        this.applyConstraint();
        this.updatePositions();
    };
    VertletSystem.prototype.updatePositions = function () {
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            obj.update(this.dt);
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
            var dist = Vec2Length(diff); // distance from center
            if (dist > radius - 10) { // 10 is the width of the object
                var n = diff.mult(1 / dist);
                this.objects[i].position_current = position.add(n.mult(dist - 30));
            }
        }
    };
    return VertletSystem;
}());
var fps = 60;
var system = new VertletSystem(1 / fps);
var renderer = new Renderer();
function update() {
    system.update();
    renderer.render(system.objects);
}
update();
console.log("WORKING");
setInterval(update, 1000 / fps);
//# sourceMappingURL=main.js.map