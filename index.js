const fs = require('fs')
const Q = require('q')
const path = require('path')
const mkdirp = require('mkdirp')

function Versioning(options) {
    const defaultOpts = {
        cleanup: true,
        basePath: '',
        manifestPath: path.join(__dirname, 'manifest.json')
    }
    this.options = Object.assign({}, defaultOpts, options)
    this.versions = {}
}

Versioning.prototype.updateVersions = function(chunks) {
    const promises = []
    const versions = chunks.reduce((versions, chunk) => {
        if (chunk.rendered) {
            const [mainFile, ...otherFiles] = chunk.files;
            const extensions = otherFiles.map(file => `.${file.split('.').pop()}`).concat(['']);
            versions.new[this.options.basePath+chunk.name] = `${this.options.basePath}${chunk.files[0]}`;
            if (chunk.name in this.versions) {
                const filenames = extensions.map(e => `${this.outputPath}/${this.versions[chunk.name]}${e}`);
                versions.filesToRemove = versions.filesToRemove.concat(filenames);
            }
        }
        return versions
    }, {
        new: {},
        filesToRemove: []
    })
    if (Object.keys(versions.new).length > 0) {
        // console.log(this.versions)
        this.versions = Object.assign({}, this.versions, versions.new)
        // console.log(this.versions)

        const writeManifestPromise = Q.defer()
        fs.writeFile(this.options.manifestPath, JSON.stringify(this.versions, null, 4), function(err) {
            if (err) throw err
            writeManifestPromise.resolve()
        })
        promises.push(writeManifestPromise)

        if (this.options.cleanup)
            promises.push(this.cleanup(versions.filesToRemove))
    }

    return Q.all(promises)
}

Versioning.prototype.cleanup = function(files) {
    const promises = []
    if (files.length > 0) {
        files.forEach(function(f) {
            const done = Q.defer()
            fs.unlink(f, function() { done.resolve() })
            promises.push(done.promise)
        })
    }

    return Q.all(promises)
}

Versioning.prototype.apply = function(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
        console.log("we are here again", compiler.context, this.options.manifestPath)
        this.outputPath = compiler.options.output.path
        this.previousManifest = this.options.manifestPath
        mkdirp(path.dirname(this.options.manifestPath), (err) => {
            if (err) throw err
            fs.stat(this.previousManifest, (err, stats) => {
                if (stats && stats.isFile()) {
                    delete require.cache[this.previousManifest]
                    this.versions = require(this.previousManifest)
                }
                this.updateVersions(compilation.chunks)
                .then((results) => callback())
            })
        })
    })
}

module.exports = Versioning