import lp from "./implementation/algorithm/layoutplanck";
import colorHierarchy from './implementation/colorhierarchy';
import contourHierarchy from './implementation/contourhierarchy';

/*
 * Implanckementation.
 */
export default function() {
    let bubbletreemap,
        padding = 10,
        curvature = 10,
        colormap = [],
        width = 800,
        height = 800,
        hierarchyRoot = [];

    return bubbletreemap = {
        doColoring: function() {
            // Coloring similar to paper. Adjust ./algorithm/colorhierarchy.js to change coloring.
            colorHierarchy(hierarchyRoot, colormap);
            return bubbletreemap;
        },

        doLayout: function() {
            lp(hierarchyRoot, padding, width, height);
            return bubbletreemap;
        },

        getContour: function() {
            // Compute contours.
            return contourHierarchy(hierarchyRoot, padding, curvature);
        },

        hierarchyRoot: function(_) {
            if(arguments.length) {
                _.descendants().forEach(function(node) {
                    if(!node.r)
                        node.r = node.value; // Take value as radius if no radius is explicitly specified.

                    if(!node.uncertainty)
                        node.uncertainty = node.data.uncertainty;
                });
                return (hierarchyRoot = _, bubbletreemap);
            }
            else {
                return hierarchyRoot;
            }
        },

        padding: function(_) {
            return arguments.length ? (padding = +_, bubbletreemap) : padding;
        },

        width: function(_) {
            return arguments.length ? (width = +_, bubbletreemap) : width;
        },

        height: function(_) {
            return arguments.length ? (height = +_, bubbletreemap) : height;
        },

        curvature: function(_) {
            return arguments.length ? (curvature = +_, bubbletreemap) : curvature;
        },

        colormap: function(_) {
            return arguments.length ? (colormap = _, bubbletreemap) : colormap;
        }
    };
}
