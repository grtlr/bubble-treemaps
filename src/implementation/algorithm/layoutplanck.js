import * as planck from 'planck-js';
import getLayerClusters from './getlayerclusters';

// Extend array prototype by unique function.
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};


export default function(hierarchyRoot, padding, width, height) {

    // Circle pack by d3.
    let pack = d3.pack()
        .radius(function(d) { return d.r; })
        .size([width, height]);

    pack(hierarchyRoot); // Use pack to arrange circles on deepest layer.

    for(let layerDepth = hierarchyRoot.height - 1; layerDepth >= 0; layerDepth--) {
        // Get clusters of circles on this layer.
        let layerClusters = getLayerClusters(hierarchyRoot, layerDepth, padding);

        // Sort clusters by parents parent, to set correct center of attraction for bodies.
        let pps = [];
        layerClusters.forEach(function(cluster) {
            pps.push(cluster.parent.parent);
        });
        pps = pps.unique();

        // Do the layout.
        pps.forEach(function(pp) {
            let currentPPClusters = layerClusters.filter(function(cluster) {
                return cluster.parent.parent === pp;
            });

            let circleList = [];
            currentPPClusters.forEach(function(cluster) {
                circleList = circleList.concat(cluster.nodes);
            });

            let centroid = getCircleCentroid(circleList);

            console.log(layerClusters);
            console.log(currentPPClusters);
            layoutClusters(currentPPClusters, centroid);
        });
    }
}

function layoutClusters(layerClusters, centroid) {
    // Create world with zero gravity.
    let world = planck.World({
        gravity: planck.Vec2(0,0)
    });

    // Create bodies for groups.
    let layerClusterBodies = [];
    layerClusters.forEach(function(layerCluster) {
        layerClusterBodies.push(createClusterBody(layerCluster, world));
    });

    // Create attractor.
    let attractorBody = world.createBody(planck.Vec2(centroid.x, centroid.y));

    // Create joints between layerClusterBodies and attractor.
    layerClusterBodies.forEach(function(layerClusterBody) {
        let distanceJoint = planck.DistanceJoint( {
                frequencyHz : 0.9, // TODO: Try to avoid overlapping in large datasets!
                dampingRatio : 0.001 // TODO: ''
            },
            attractorBody,
            attractorBody.getPosition(),
            layerClusterBody,
            layerClusterBody.getPosition()
        );
        distanceJoint.m_length = 0; // Set the length to zero as it's calculated as the distance between the anchors. TODO: PR on planck-js repo to fix bug.

        world.createJoint(distanceJoint);
    });

    // Prepare for simulation. Typically we use a time step of 1/60 of a
    // second (60Hz) and 10 iterations. This provides a high quality simulation
    // in most game scenarios.
    let timestep = 1.0 / 60.0;
    let velocityIterations = 6;
    let positionIterations = 2;

    // Simulation loop.
    for (let i = 0; i < 1000; ++i) {
        // Instruct the world to perform a single step of simulation.
        // It is generally best to keep the time step and iterations fixed.
        world.step(timestep, velocityIterations, positionIterations);
    }

    // Write results back to hierarchy.
    for (let body = world.getBodyList(); body; body = body.getNext()) {
        for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
            if(fixture.getShape().getType() === planck.Circle.TYPE) {
                let center = body.getWorldPoint(fixture.getShape().getCenter());

                let rawCircle = fixture.getUserData();
                rawCircle.x = center.x;
                rawCircle.y = center.y;
            }
        }
    }
}

function createClusterBody(layerCluster, world) {
    // Get centroid of all circles.
    let bodyCentroid = getCircleCentroid(layerCluster.nodes);

    // Create body.
    let body = world.createDynamicBody(bodyCentroid);

    // Add circles as fixtures.
    let circleFD = {
        density: 1.0,
        friction: 0.00001
    };

    layerCluster.nodes.forEach(function(circle) {
        let centerGlobal = planck.Vec2(circle.x, circle.y);
        let centerLocal = centerGlobal.sub(bodyCentroid);
        let fixture = body.createFixture(planck.Circle(centerLocal, circle.r + circle.planckPadding), circleFD);
        fixture.setUserData(circle);
    });

    // Return completed body.
    return body;
}

function getCircleCentroid(circles) {
    // Calculate centroid of circle group.
    let circleMassSum = 0;
    let centroid = planck.Vec2.zero();

    circles.forEach(function(circle) {
        let circleMass = circle.r * circle.r * Math.PI;
        circleMassSum += circleMass;
        centroid.x += circle.x * circleMass;
        centroid.y += circle.y * circleMass;
    });

    centroid.mul(1.0/circleMassSum);

    return centroid;
}