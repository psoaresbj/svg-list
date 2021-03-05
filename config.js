const { extendDefaultPlugins } = require('svgo');

const config = {
  /**
   * setup SVGO plugins as you like but
   * remember: the goal of this tool
   * is to use an array of paths to form
   * the icon, so, basically, this parses the
   * svg html and gets the viewbox attr and an
   * array of `d` (from paths) attrs only.
   */
    plugins: extendDefaultPlugins([
      { name: 'removeAttrs', attrs: '(stroke|fill)' },
      'removeDimensions',
      { name: 'removeViewBox', active: false }
  ])
};

module.exports = config;
