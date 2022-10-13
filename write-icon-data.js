const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} IconData
 * @property {string[]} type
 */

/** @type {Object.<string, IconData>} */
const icons = {};

const iconRootDirectory = path.join(__dirname, 'svg');
const outputFile = path.join(__dirname, 'dist', 'icons.json');

/** @type {string[]} */
const categories = fs
  .readdirSync(iconRootDirectory, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

categories.forEach((category) => {
  const foundSVGs = fs
    .readdirSync(path.join(iconRootDirectory, category))
    .filter(fileName => fileName.endsWith('.svg'));
  foundSVGs.forEach((fileName) => {
    const svgKey = fileName.slice(fileName.indexOf('-') + 1, -4);
    if (Object.hasOwnProperty.call(icons, svgKey)) {
      icons[svgKey].types.push(category);
    } else {
      icons[svgKey] = {
        types: [category],
      };
    }
  });
});

fs.writeFileSync(outputFile, JSON.stringify(icons));
