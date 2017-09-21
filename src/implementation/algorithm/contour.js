import Arc from "../../geometry/arc";
import Circle from "../../geometry/circle";
import Vec2 from "../../geometry/vec2";

export default function(nodes, curvature) {
    let circles = [];
    nodes.forEach(function (node) {
        // Add circles with radius increased by padding. This generates the spacing between circle and contour.
        circles.push(new Circle(node.x, node.y, node.r + node.contourPadding));
    });

    let outerCircleRing = getOuterCircleRing(circles, curvature);

    let arcs = [];

    arcs = arcs.concat(generateCircleArcs(outerCircleRing));
    arcs = arcs.concat(generateTangentArcs(outerCircleRing, curvature));

    return arcsToPaths(arcs);
}

let FLOATINGPOINT_EPSILON = 0.00001;

// Get index and intersection point of next circle on border, in counter-clockwise direction.
// The parameter 'direction' points into the direction, where the first intersection with current circle was found.
function getNextClockwiseIntersection(currentCircleIndex, circleArray, direction) {
    let currentCircle = circleArray[currentCircleIndex];
    let allIntersections = [];

    for (let i = 0; i < circleArray.length; i++) {
        if (!(i === currentCircleIndex)) {
            if (circleArray[i].intersects(circleArray[currentCircleIndex])) {
                let intersectionPoints = circleArray[i].intersectionPoints(circleArray[currentCircleIndex]);
                // Store intersection points and index of corresponding circle
                allIntersections.push({
                    'intersectionPoint': intersectionPoints[0],
                    'circleIndex': i
                });
                allIntersections.push({
                    'intersectionPoint': intersectionPoints[1],
                    'circleIndex': i
                });
            }
        }
    }

    let smallestAngle = 7; // Init with max angle (> 2*PI).
    let intersectionWithSmallestAngle = undefined; // Init as undefined.
    allIntersections.forEach(function (intersection) {
        let angle = direction.angle(intersection.intersectionPoint.sub(currentCircle.center));

        if (angle > FLOATINGPOINT_EPSILON && angle < smallestAngle) {
            smallestAngle = angle;
            intersectionWithSmallestAngle = intersection;
        }
    });

    return intersectionWithSmallestAngle;
}

// Get ring of circles that defines the outer border, together with the corresponding intersection points.
function getOuterCircleRing(circles, curvature) {
    // Create deep copy of circles, as they are modified in the next steps.
    //let circlesEnlarged = circles.map(a = > Object.assign({}, a));
    let circlesEnlarged = circles.map(function (a) {
        return Object.assign({}, a)
    });

    // Add the radius s of the tangent circles to avoid self-intersections.
    circlesEnlarged.forEach(function (circle) {
        circle.radius += curvature;
    });

    // Find index of the leftmost circle.
    let leftmostCircleIndex = 0;
    for (let i = 1; i < circlesEnlarged.length; i++) {
        if (circlesEnlarged[i].center.x - circlesEnlarged[i].radius < circlesEnlarged[leftmostCircleIndex].center.x - circlesEnlarged[leftmostCircleIndex].radius) {
            leftmostCircleIndex = i;
        }
    }

    // Get the outer ring of circles.
    let outerCircleRing = [];
    let index = leftmostCircleIndex;
    let referenceDirection = new Vec2(-1, 0);
    while (true) {
        let intersection = getNextClockwiseIntersection(index, circlesEnlarged, referenceDirection);
        if (intersection === undefined)
            break;

        index = intersection.circleIndex;
        let circle = circles[index];
        referenceDirection = intersection.intersectionPoint.sub(circle.center);

        if (outerCircleRing[0] && index === outerCircleRing[0].circleIndex && intersection.intersectionPoint.distance(outerCircleRing[0].intersectionPoint) < FLOATINGPOINT_EPSILON) {
            break;
        }

        outerCircleRing.push({
            'circle': circle,
            'intersectionPoint': intersection.intersectionPoint,
            'circleIndex': index
        });
    }

    return outerCircleRing;
}

// Generate arcs that describe the outer border of circles.
function generateCircleArcs(outerCircleRing) {
    let arcs = [];

    for (let i = 0; i < outerCircleRing.length; i++) {
        let circle = outerCircleRing[i].circle;
        let firstIntersection = outerCircleRing[i].intersectionPoint;
        let secondIntersection = outerCircleRing[(i + 1) % outerCircleRing.length].intersectionPoint;

        let centerToFirstIntersection = firstIntersection.sub(circle.center);
        let centerToSecondIntersection = secondIntersection.sub(circle.center);
        let arcStartAngle = new Vec2(0, -1).angle(centerToFirstIntersection);
        let arcEndAngle = new Vec2(0, -1).angle(centerToSecondIntersection);

        arcs.push(new Arc(circle.center.x, circle.center.y, arcStartAngle, arcEndAngle, circle.radius));
    }

    return arcs;
}

// Generate tangent arcs that fill the space between circle arcs.
function generateTangentArcs(outerCircleRing, curvature) {
    let arcs = [];

    for (let i = 0; i < outerCircleRing.length; i++) {
        let intersection = outerCircleRing[i].intersectionPoint;
        let firstCircle = outerCircleRing[(i > 0) ? i - 1 : outerCircleRing.length - 1].circle;
        let secondCircle = outerCircleRing[i].circle;

        let intersectionToFirstCenter = firstCircle.center.sub(intersection);
        let intersectionToSecondCenter = secondCircle.center.sub(intersection);
        let arcEndAngle = new Vec2(0, -1).angle(intersectionToFirstCenter);
        let arcStartAngle = new Vec2(0, -1).angle(intersectionToSecondCenter);

        arcs.push(new Arc(intersection.x, intersection.y, arcStartAngle, arcEndAngle, curvature));
    }

    return arcs;
}

function arcsToPaths(arcs) {
    let paths = [];
    let arcGen = d3.arc();

    arcs.forEach(function (arc) {
        let startAngleTemp = arc.startAngle;

        if (startAngleTemp > arc.endAngle) {
            startAngleTemp -= 2 * Math.PI;
        }

        paths.push({
            d: arcGen({
                innerRadius: arc.radius,
                outerRadius: arc.radius,
                startAngle: startAngleTemp,
                endAngle: arc.endAngle
            }),
            transform: "translate(" + arc.center.x + "," + arc.center.y + ")"
        });
    });

    return paths;
}
