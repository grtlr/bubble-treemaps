export default Vec2;

function Vec2(x, y) {
    this.x = x;
    this.y = y;

    this.distance = function (vec) {
        var deltaX = this.x - vec.x;
        var deltaY = this.y - vec.y;
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    };

    this.sub = function (vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    };

    this.add = function (vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    };

    this.scale = function (scale) {
        return new Vec2(this.x * scale, this.y * scale);
    };

    this.angle = function (vec) {
        var result = Math.atan2(vec.y, vec.x) - Math.atan2(this.y, this.x);
        if (result < 0)
            result += 2 * Math.PI;
        return result;
    }

    this.magnitude = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    this.toUnitVector = function () {
        return this.scale(1.0/this.magnitude());
    }
}