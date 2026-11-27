// Keep the map controls and markers available when the phone has no internet.
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const files = { script: 'dist/leaflet.js', css: 'dist/leaflet.css', license: 'LICENSE' };
const assets = {};
for (const [name, file] of Object.entries(files)) {
  assets[name] = readFileSync(require.resolve('leaflet/' + file), 'utf8');
}
writeFileSync(resolve(__dirname, '../src/leaflet.generated.js'), 'module.exports = ' + JSON.stringify(assets) + ';\n');
