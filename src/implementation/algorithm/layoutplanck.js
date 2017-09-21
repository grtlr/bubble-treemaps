import * as planck from 'planck-js';
import getLayerClusters from './getlayerclusters';

export default function(hierarchyRoot, padding, width, height) {

    // Circle pack by d3.
    let pack = d3.pack()
        .radius(function(d) { return d.r; })
        .size([width, height]);

    pack(hierarchyRoot); // Use pack to arrange circles on deepest layer.

    for(let layerDepth = hierarchyRoot.height - 1; layerDepth >= 0; layerDepth--) {
        // Get clusters of circles on this layer.
        let layerClusters = getLayerClusters(hierarchyRoot, layerDepth, padding);
        // Do the layout.
        layoutClusters(layerClusters, width, height);
    }
}

function layoutClusters(layerClusters, width, height) {
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
    let attractorBody = world.createBody(planck.Vec2(width/2,height/2));

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
    // Calculate centroid of circle group.
    let circleMassSum = 0;
    let bodyCentroid = planck.Vec2.zero();

    layerCluster.nodes.forEach(function(circle) {
        let circleMass = circle.r * circle.r * Math.PI;
        circleMassSum += circleMass;
        bodyCentroid.x += circle.x * circleMass;
        bodyCentroid.y += circle.y * circleMass;
    });

    bodyCentroid.mul(1.0/circleMassSum);

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