const path = require( 'path');
const dir = require('node-dir');
const { promises: fs, ex, readFile } = require('fs');
const camelCase = require('lodash/camelCase');
const htmlToJson = require('html-to-json');
const prettier = require( 'prettier');
const svgo = require('svgo');

const checkDestFolder = async path => {
  try {
    const result = await fs.stat(path);

    if (!result.isDirectory()) {
      throw new Error('Destiny directory not found');
    }

    return true;
  } catch (error) {

    return;
  }
}

const getRc = async () => {
  try {
    // get project root file
    const rootPath = path.resolve(process.cwd());
    const rcFilePath = path.resolve(rootPath, '.svglistrc.json');
    const config = await svgo.loadConfig(path.resolve(rootPath, 'config.js'));

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
    const rcFile = await fs.readFile(rcFilePath);

    const rc = JSON.parse(rcFile);

    if ( !rc ) throw 'You need to add project root file: `.svglistrc.json`';
    if ( !rc?.src ) throw 'You need to add src field to project root file: `.svglistrc.json`';
    if ( !rc?.dest ) throw 'You need to add dest field to project root file: `.svglistrc.json`';

    // set `src` and `dest folder`
    const src = path.resolve(process.cwd(), rc.src);
    const dest = path.resolve(process.cwd(), rc.dest);

    const format = rc?.format === 'json' ? 'json' : 'js';

    const plugins = rc?.plugins || config?.plugins || [];

    const subDirs = await fs.readdir(src);

    const dirs = subDirs?.map(name => ({ path: path.resolve(src, name), name }));

    return { ...rc, dest, dirs, format, plugins, src };
  } catch (error) {
    console.log('Error getting RC file:\n', error);

    return;
  }
}

const saveList = async (name, list, rc) => {
  try {
    const { dest, format } = rc
    const content = format === 'js'
      // if format is `js`
      ? prettier.format(
        // file content
        `/*eslint-disable*/\n\n/*\nThis file is auto-generated by svg-list\nhttps://github.com/psoaresbj/svg-list\n*/\n\nconst ${camelCase(name)} = ${JSON.stringify(list, null, 4)}\nexport default ${camelCase(name)};\n`
      , {
        // prettier options
        parser: 'babel',
        semi: true,
        singleQuote: true,
        bracketSpacing: true,
        trailingComma: 'all'
      })
      // if format is `json`
      : JSON.stringify(list, null, 2)
    ;

    // ensuring the dest folder exists,
    // if not, creates it
    const folderExists = await checkDestFolder(dest);

    // write the file
    await fs.writeFile(
      path.join(dest, `${camelCase(name)}.${format === 'js' ? 'js' : 'json'}`),
      content,
      'utf8',
      () => console.log(`${camelCase(name)} list was saved to '${dest}'`)
    );
  } catch (error) {
    console.log(`List "${name}" not created:\n`, error);
  }
}

const parseFile = async ({ dir, key, path: filePath }, rc) => {
  try {
    const { plugins, passAllAttributes } = rc;

    const file = await fs.readFile(filePath);

    const svgString = file.toString();

    const parsed = svgo.optimize(svgString, { path: path.resolve(dir, '/.optimized'), plugins });
    const htmlString = parsed?.data;

    const svgObj = await htmlToJson.parse(htmlString, function (svg) {
      const viewbox = svg.find('svg').attr('viewbox');

      const paths = [];

      this.map('path', path => {
        const attrs = path.attr();
        const simplePath = path.attr('d');
        delete attrs.fill;
        const parsedAttrs = Object.keys(attrs).reduce((result, key) => ({ ...result, [camelCase(key)]: attrs[key] }), {});
        paths.push(passAllAttributes ? parsedAttrs : simplePath)
      })

      return { paths, viewbox };
    });

    return { name: key, svgObj }
  } catch (error) {
    console.log(`Error parsing file: "${key}":\n`, error);

    return;
  }
}

const createList = async ({ path: dirPath, name }, rc) => {
  try {
    const { src: configSrc } = rc;
    const dirFiles = await fs.readdir(dirPath);
    const filtered = dirFiles.reduce((result, file) => {
      if (!file.match(/.svg$/)) {
        return result;
      }

      const fileDir = path.resolve(configSrc, name);
      const filePath = path.resolve(fileDir, file);
      const key = camelCase(file.replace('.svg', ''));

      return [...result, { dir: fileDir, path: filePath, key }];
    }, []);

    const files = await Promise.all(filtered.map(async file => {
      const svgObj = await parseFile(file, rc);

      return svgObj;
    }));

    const list = files.reduce((results, { name, svgObj }) => ({ ...results, [name]: svgObj }), []);

    return await saveList(name, list, rc);
  } catch (error) {
    console.log(`Error generating "${name}" list:\n`, error);
  }
}

const generate = async () => {
  try {
    const rc = await getRc();

    const { dirs } = rc;

    await Promise.all(dirs.map(async dir => await createList(dir, rc)));

    console.log(`Icon list tasks ended!`);
  } catch (error) {
    console.log('Error generating your icons file:\n', error)
  }
}

module.exports = generate;
