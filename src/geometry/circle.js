import Vec2 from "./vec2";

export default Circle;

function Circle(x, y, radius) {
    this.center = new Vec2(x, y);
    this.radius = radius;

    // See: http://paulbourke.net/geometry/circlesphere/
    this.intersects = function (circle) {
        var distance = this.center.distance(circle.center);

        // Circles are to far from each other.
        if (distance > this.radius + circle.radius)
            return false;
        // One circle is contained in the other.
        if (distance < Math.abs(this.radius - circle.radius))
            return false;
        // Circles intersect.
        return true;
    };

    // See: http://paulbourke.net/geometry/circlesphere/
    this.intersectionPoints = function (circle) {
        var P0 = this.center;
        var P1 = circle.center;

        var d = this.center.distance(circle.center);
        var a = (this.radius * this.radius - circle.radius * circle.radius + d * d) / (2 * d);
        var h = Math.sqrt(this.radius * this.radius - a * a);

        var P2 = P1.sub(P0).scale(a / d).add(P0);

        var x3 = P2.x + h * (P1.y - P0.y) / d;
        var y3 = P2.y - h * (P1.x - P0.x) / d;
        var x4 = P2.x - h * (P1.y - P0.y) / d;
        var y4 = P2.y + h * (P1.x - P0.x) / d;

        return [new Vec2(x3, y3), new Vec2(x4, y4)];
    };
}