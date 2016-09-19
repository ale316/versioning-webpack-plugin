# versioning-webpack-plugin
Webpack plugin that performs versioning using a `manifest.json` file for storing the filename aliases.

This plugin cleans after itself by removing old manifest files when `cleanup: true` in the options. 

# Usage
```javascript
const VersioningPlugin = require('versioning-webpack-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')

module.exports = {
    output: {
        filename: "[name]-[chunkhash].js"
    },
    /// ... rest of config
    plugins: [
        // these are the default options
        new VersioningPlugin({
            cleanup: true,                      // should it remove old files?
            basePath: './',                     // manifest.json base path
            manifestFilename: 'manifest.json'   // name of the manifest file
        }),
        new WebpackMd5Hash()
    ]
}
```