const config = {
    /**
     * setup SVGO plugins as you like but
     * remember: the goal of this tool
     * is to use an array of paths to form
     * the icon, so, basically, this parses the
     * svg html and gets the viewbox attr and an
     * array of `d` (from paths) attrs only.
     */
    plugins: [
        { cleanupAttrs: true, },
        { removeDoctype: true, },
        { removeXMLProcInst: true, },
        { removeComments: true, },
        { removeMetadata: true, },
        { removeTitle: true, },
        { removeDesc: true, },
        { removeUselessDefs: true, },
        { removeEditorsNSData: true, },
        { removeEmptyAttrs: true, },
        { removeHiddenElems: true, },
        { removeEmptyText: true, },
        { removeEmptyContainers: true, },
        { removeViewBox: false, },
        { cleanupEnableBackground: true, },
        { convertStyleToAttrs: true, },
        { convertColors: true, },
        { convertPathData: true, },
        { convertTransform: true, },
        { removeUnknownsAndDefaults: true, },
        { removeNonInheritableGroupAttrs: true, },
        { removeUselessStrokeAndFill: true, },
        { removeUnusedNS: true, },
        { cleanupIDs: true, },
        { cleanupNumericValues: true, },
        { moveElemsAttrsToGroup: true, },
        { moveGroupAttrsToElems: true, },
        { collapseGroups: true, },
        { removeRasterImages: false, },
        { mergePaths: true, },
        { convertShapeToPath: true, },
        { sortAttrs: true, },
        { removeDimensions: true, },
        { removeAttrs: {attrs: '(stroke|fill)'}, },
    ]
}

module.exports = config;