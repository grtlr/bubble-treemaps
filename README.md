# Bubble Treemaps for Uncertainty Visualization

I want to thank [Thilo Spinner](https://github.com/tlow0) for providing this implementation.

### Disclaimer
This is an ongoing rewrite of Bubble Treemaps in JavaScript and not the code that was used to generate the images in the paper. 

A live demo can be found at https://grtlr.github.io/bubble-treemaps/.

<img src="https://github.com/grtlr/bubble-treemaps/blob/master/bubble-treemap.png?raw=true" alt="Example of a Bubble Treemap" width="300px" height="300px">

More details about the publication, including a pre-print of the paper, can be found [here](http://graphics.uni-konstanz.de/publikationen/Goertler2018BubbleTreemapsUncertainty/index.html).

### Abstract
We present a novel type of circular treemap, where we intentionally allocate extra space for additional visual variables. With this extended visual design space, we encode hierarchically structured data along with their uncertainties in a combined diagram. We introduce a hierarchical and force-based circle-packing algorithm to compute Bubble Treemaps, where each node is visualized using nested contour arcs. Bubble Treemaps do not require any color or shading, which offers additional design choices. We explore uncertainty visualization as an application of our treemaps using standard error and Monte Carlo-based statistical models. To this end, we discuss how uncertainty propagates within hierarchies. Furthermore, we show the effectiveness of our visualization using three different examples: the package structure of Flare, the S&P 500 index, and the US consumer expenditure survey.

### Citation
```
@article{Goertler2017BubbleTreemapsUncertainty,
  author  = {Jochen Görtler and Christoph Schulz and Daniel Weiskopf and Oliver Deussen},
  title   = {Bubble Treemaps for Uncertainty Visualization},
  journal = {IEEE Transactions on Visualization and Computer Graphics},
  year    = {2018},
  volume  = {24},
  number  = {1},
  pages   = {719-728},
  doi     = {10.1109/TVCG.2017.2743959},
}
```

### Building 

    npm run build
    npm run minimize
