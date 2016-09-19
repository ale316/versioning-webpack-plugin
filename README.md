# versioning-webpack-plugin
Webpack plugin that performs versioning using a `manifest.json` file for storing the filename aliases.

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
            cleanup: true,
            basePath: './',
            manifestFilename: 'manifest.json'
        }),
        new WebpackMd5Hash()
    ]
}
```