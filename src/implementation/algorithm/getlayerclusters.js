export default function(hierarchyRoot, layerDepth, padding) {
    var clusters = [];

    let layerNodes = hierarchyRoot.descendants().filter(function(candidate) {
        return candidate.depth === layerDepth;
    });

    layerNodes.forEach(function(node) {
        let clusterNodes = node.descendants().filter(function(candidate){
            return !candidate.children;
        });

        let clusterParent = node.ancestors().filter(function(ancestor) {
            return ancestor.depth === layerDepth;
        })[0];

        clusterNodes.forEach(function(node) {
            let path = node.path(clusterParent).slice(1,-1);

            let uncertaintySum = path.reduce(function(acc, pathnode){
                return acc + pathnode.uncertainty;
            }, 0);

            let contourClusterParentUncertainty = clusterParent.uncertainty/2;                                // Padding for contour (contour lies 50% outside of parent node).
            let planckClusterParentUncertainty = node !== clusterParent ? clusterParent.uncertainty : 0;      // Padding for force based layout (contours should not cut each other, i.e. full parent contour should be taken into account).

            node.contourPadding = (node.depth - clusterParent.depth) * padding + uncertaintySum + contourClusterParentUncertainty;
            node.planckPadding = (node.depth - clusterParent.depth) * padding + uncertaintySum + planckClusterParentUncertainty + 5;
        });

        clusters.push({
            nodes: clusterNodes,
            parent: clusterParent
        });
    });

    return clusters;
};