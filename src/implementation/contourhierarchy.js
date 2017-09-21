import contour from "./algorithm/contour";
import getLayerClusters from './algorithm/getlayerclusters';

export default function(hierarchyRoot, padding, curvature) {
    let contours = [];
    for(let layerDepth = hierarchyRoot.height - 1; layerDepth >= 0; layerDepth--) {
        // Get clusters of circles on this layer.
        let layerClusters = getLayerClusters(hierarchyRoot, layerDepth, padding);

        // Create contour for each cluster.
        layerClusters.forEach(function(cluster) {
            let generatedContour = contour(cluster.nodes, curvature);

            // Assign color to contour.
            generatedContour.forEach(function(segment) {
                segment.strokeWidth = cluster.parent.uncertainty;
            });

            contours = contours.concat(generatedContour);
        });
    }

    return contours;
}