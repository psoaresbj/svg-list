# svg-list

> Generates a JSON or Javascript list with optimised SVGs

[![NPM](https://img.shields.io/npm/v/@psoares/svg-list.svg)](https://www.npmjs.com/package/@psoares/svg-list) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Description

This small script is useful to maintain your project icons updated and optimised without having the painful work of everytime you change an svg icon file you need to go through SVG optimizer, clean the code and then just add it to you custom js or json files.

## Install

```bash
yarn add @psoares/svg-list
```

## Usage

- Create your setup file in the root of your project with the name `.svglistrc.json`
```javascript
{
    "src": "icons", // source directory with multiple directories
    "dest": "src/components/icons", // target directory for js / json fiiles
    "format": "js" // optional: `js` (default) or `json`
}
```

- To generate your files run
```bash
yarn svglist generate
```

## To do:

- To preview your generated files run
```bash
yarn svglist preview
```
This will fireup a simple react app that runs in port 8004 with a preview of all the svgs that you have generated.

**Note**: *this will not generate the svg files for you, so you need to run generate first*

## License

MIT © [psoaresbj](https://github.com/psoaresbj)
