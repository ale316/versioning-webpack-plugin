const fs = require('fs')
const Q = require('q')

function Versioning(options) {
    const defaultOpts = {
        cleanup: true,
        basePath: './',
        manifestFilename: 'manifest.json'
    }
    this.options = Object.assign({}, defaultOpts, options)
    this.versions = {}
}

Versioning.prototype.updateVersions = function(chunks) {
    const promises = []
    const versions = chunks.reduce((versions, chunk) => {
        if (chunk.rendered) {
            versions.new[chunk.name] = chunk.files[0]
            if (chunk.name in this.versions)
                versions.filesToRemove.push(`${this.outputPath}/${this.versions[chunk.name]}`)
        }
        return versions
    }, {
        new: {},
        filesToRemove: []
    })
    if (Object.keys(versions.new).length > 0) {
        this.versions = Object.assign({}, this.versions, versions.new)

        const outputFilename = `${this.outputPath}/${this.options.manifestFilename}`
        const writeManifestPromise = Q.defer()
        fs.writeFile(outputFilename, JSON.stringify(this.versions, null, 4), function() {
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
        this.outputPath = `${compiler.context}/${compiler.options.output.path}`
        const previousManifest = `${this.outputPath}/${this.options.manifestFilename}`
        fs.stat(previousManifest, (err, stats) => {
            if (stats && stats.isFile()) {
                this.versions = require(previousManifest)
            }
            this.updateVersions(compilation.chunks)
            .then((results) => callback())
        })
    })
}

module.exports = Versioning