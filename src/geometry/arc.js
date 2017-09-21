import Vec2 from "./vec2";

export default Arc;

function Arc(x, y, startAngle, endAngle, radius) {
    this.center = new Vec2(x, y);
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.radius = radius;
}