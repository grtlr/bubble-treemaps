export default function(hierarchyRoot, colormap) {
    let colorIndex = 0;
    hierarchyRoot.children.forEach(function(child) {
        child.descendants().forEach(function(desc){
            desc.color = colormap[colorIndex % colormap.length];
        });
        colorIndex++;
    });
}