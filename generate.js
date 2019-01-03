// get node stuff
const path = require('path');
const dir = require('node-dir');
const fs = require('fs-extra');
const camelCase = require('camelcase');
const htmlToJson = require('html-to-json');
const SVGO = require('svgo');
const prettier = require('prettier');

// get project root file
const rootPath = path.resolve(process.cwd());

/**
 * REQUIRED
 * require rc file
 * required options:
 *   - src: source of the svg base folder
 *   - dest: destination path for js / json files
 *
 * optional options:
 *   - format: one of `json` || `js` (default: `js`)
 */
const rc = require(path.resolve(rootPath, '.svglistrc.json'));

// get default config
const config = require('./config');

// set file format
// from rc file || `js`
const format = rc.format && rc.format === 'json' ? 'json' : 'js';

// set svgo plugins
// from rc file or default
const plugins = rc.plugins && rc.plugins.length ? rc.plugins : config.plugins;

/**
 * Inits svgo with
 * plugins options
 */
const svgo = new SVGO({ plugins });

// check if rc file exists
if ( !rc ) return console.log('You need to add project root file: `.svglistrc.json`');
if ( !rc || !rc.src ) return console.log('You need to add src field to project root file: `.svglistrc.json`');
if ( !rc || !rc.dest ) return console.log('You need to add dest field to project root file: `.svglistrc.json`');

// ser `src` and `dest folder`
const src = path.resolve(process.cwd(), rc.src);
const dest = path.resolve(process.cwd(), rc.dest);

/**
 *
 * fn to return directories
 * under the base path
 */
const getDirs = cb => dir.subdirs(src, (err, dirs) => {
    // throw error if exists
    if (err) throw err

    // transform directories arr
    // adding path and name
    const directories = dirs.reduce((acc, directory) => [...acc, {
        path: path.resolve(directory),
        name: directory.split(path.sep).pop(),
    }], []);

    // return callback
    return cb(directories);
});

/**
 *
 * @param {string} name sets the list file name
 * @param {object} list json object with svg parts
 *
 * @description Function to save (js/json) files into `dest` with svg data
 */
const saveList = (name, list) => {
    const content = format === 'js'
        // if format is `js`
        ? prettier.format(
            // file content
            `const ${camelCase(name)} = ${JSON.stringify(list, null, 4)}\nexport default ${camelCase(name)};\n`
        , {
            // prettier options
            parser: 'babylon',
            semi: true,
            singleQuote: true,
            bracketSpacing: true,
            trailingComma: 'all'
        })
        // if format is `json`
        : JSON.stringify(list, null, 4)
    ;

    // ensuring the dest folder exists,
    // if not, creates it
    fs.ensureDir(dest,
        // create the file with all svgs
        // data
        () => fs.writeFile (
            path.join(dest, `${camelCase(name)}.${format === 'js' ? 'js' : 'json'}`),
            content,
            'utf8',
            () => console.log(`${camelCase(name)} list was saved to '${dest}'`)
        )
    )
}

/**
 *
 * @param {array} dirs array of objects with folders info
 * @description function that iterates over directories and returns saveList as callback
 */
const createLists = dirs => dirs.map((directory, i) => {
    // creating blank list
    const list = {};
    // iterating over all
    // svg files inside dir
    dir.readFilesStream(
        directory.path,
        { match: /.svg$/ },
        (err, stream, next) => {
            // if goes south, throws err
            if (err) throw err
            // stream the file content
            stream.on('data', buffer => {
                // sets fileName
                const fileName = camelCase(path.basename(stream.path, '.svg'))
                // use svgo to optimize svg
                svgo.optimize(
                    buffer.toString(),
                    { path: path.resolve(path.join(directory.path, '/.optimized')) }
                ).then(r => {
                    // get svg as string
                    const html = r.data.toString();
                    // parses the string into json obj
                    htmlToJson.parse(
                        html,
                        function (svg) {
                            // find viewbox
                            const viewbox = svg.find('svg').attr('viewbox');
                            // init path arr
                            const paths = [];
                            // iterates over each path
                            // returning an obj with paths
                            // array and viewbox str
                            this.map('path', (path) => paths.push(path.attr('d'))).then(() => {
                                list[fileName] = { viewbox, paths }
                                next()
                            })
                        }
                    )
                // if any error during each svg optimise,
                // throw console.log err
                }).catch(err => console.log(`\nerror in ${fileName} @ ${directory.name}:\n${err}\n`))
            })
        },
        () => {
            // run saveList
            // with this particular
            // directory data
            saveList(directory.name, list)
        }
    )
});

// prepare
const init = () => getDirs(dirs => createLists(dirs));

module.exports = init;