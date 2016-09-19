# versioning-webpack-plugin
Webpack plugin that performs versioning using a `manifest.json` file for storing the filename aliases.

# Usage
```javascript
const VersioningPlugin = require('versioning-webpack-plugin')

module.exports = {
    /// ... rest of config
    plugins: [
        // default options
        new VersioningPlugin({
            cleanup: true,
            basePath: './',
            manifestFilename: 'manifest.json'
        })
    ]
}
```