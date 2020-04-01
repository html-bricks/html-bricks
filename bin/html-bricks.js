#! /usr/bin/env node

const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const nodeWatch = require('node-watch')
const minimatch = require('minimatch')

const dirname = process.cwd()
const flag = process.argv[2]

if (process.argv.length > 3 || (flag && flag !== '--watch')) {
  throw new Error('Recieved unknown flags. The only legal flag is --watch. Used that or don\'t use flags.')
}

const watch = flag === '--watch'

let config = {
  sourceDir: 'src',
  buildDir: 'build',
  ignoreFileNames: [],
  plugins: [],
  ignoreFiles: []
}

try {
  const customConfig = fs.readJsonSync(path.resolve(dirname, 'config.json'))

  config = Object.assign({}, config, customConfig)

  console.log('(Using custom config)\n')
} catch (e) {
  console.log('(Using default config)\n')
}

function appendTimestampToFileName (pathName) {
  return pathName.replace(/\/.+$/, function (str) {
    if (!str.match(/\.html/)) {
      const split = str.split('.')
      return split[0] + Date.now() + (split[1] ? '.' + split[1] : '')
    }
    return str
  })
}

function extractFileName (pathName) {
  return pathName.replace(/(.*)\/.+$/, function (match, p1) {
    return match.replace(p1 + '/', '')
  })
}

function mapFile (file) {
  const src = path.resolve(dirname, file)
  const dest = path.resolve(dirname, file.replace(new RegExp('^' + config.sourceDir), config.buildDir))
  return {
    src,
    dest
  }
}

function removeBreaks (str) {
  return str.replace(/\n\s*/g, '').replace(/<\/module(:([^>].)*)?>/g, function (match) {
    return match + '\n'
  })
}

function getRelativePath (fullPath) {
  return fullPath
    .replace(new RegExp('^' + dirname + '/'), '')
    .replace(new RegExp('^' + config.sourceDir + '/'), '')
}

const moduleReg = /<module>(.*)<\/module>\n/g
const moduleHeadReg = /<module:head>(.*)<\/module:head>\n/g
const headReg = /(<head>.*)(<\/head>)/

function renderFile (name, content, modules, addWarning) {
  const headTags = []

  const rendered = content.replace(moduleReg, function (match, p1) {
    const inferred = modules.find(m => m.name === p1.replace(/^\s+/, '').replace(/\s+$/, ''))
    if (inferred) {
      if (inferred.content.match(moduleReg)) {
        addWarning('Module ' + inferred.name + ' contains illegal <module> tag. Nested modules are not supported. Ignored it, but it should be removed.')
      }

      const moduleHeader = removeBreaks(inferred.content).match(moduleHeadReg) || []

      moduleHeader.forEach(head => head.replace(moduleHeadReg, function (match, p1) {
        if (headTags.indexOf(p1) === -1) {
          headTags.push(p1)
        }
        return ''
      }))

      const scrapedModule = inferred.content.replace(moduleHeadReg, '')

      return scrapedModule
    }

    addWarning('Unknown module: ' + p1)
    return ''
  })

  if (!rendered.match(headReg)) {
    addWarning('No head found in ' + name + ', but heads are found in modules. Add a head to parent if you want to render child head tags.')
  }

  const renderedWithHead = rendered.replace(/\n\s*/g, '').replace(headReg, function (match, p1, p2) {
    return p1 + headTags.join('') + p2
  })
  return renderedWithHead
}

function processPostBuildPlugins (files) {
  function runSerial (funcs) {
    return funcs.reduce((p, func) => {
      return p.then((res) => func(res))
    }, Promise.resolve(files))
  }

  if (Array.isArray(config.plugins) && config.plugins.length) {
    const funcs = config.plugins
      .map(pluginRaw => {
        if (typeof pluginRaw === 'string') {
          return {
            resolve: pluginRaw,
            options: {}
          }
        }
        return pluginRaw
      })
      .map(pluginObj => {
        let plugin
        let pluginName
        if (pluginObj.resolve.match(/^\.\//)) {
          pluginName = pluginObj.resolve
          plugin = require(path.resolve(dirname, pluginName))
        } else if (pluginObj.resolve.match(/^html-bricks-/)) {
          pluginName = pluginObj.resolve
          plugin = require(path.resolve(dirname, 'node_modules', pluginName))
        } else {
          pluginName = 'html-bricks-' + pluginObj.resolve
          plugin = require(path.resolve(dirname, 'node_modules', pluginName))
        }

        if (plugin.postBuild) {
          console.log('Running ' + pluginName + '.postBuild\n')

          return (f) => plugin.postBuild(f, config, pluginObj.options)
        } else {
          console.log(pluginName + ' has no postBuild, so it is ignored\n')

          return (f) => f
        }
      })

    return runSerial(funcs)
  }

  return files
}

function build () {
  console.time('Build time')

  glob(config.sourceDir + '/**/*', function (err, files) {
    if (err) {
      throw err
    }

    const filteredFiles = files.filter(file => !config.ignoreFiles.find(f => minimatch(getRelativePath(file), f)))
    const allHtmlFiles = filteredFiles.filter(file => file.match(/\.html$/))
    const htmlFiles = allHtmlFiles.filter(file => !file.match(/\.module\.html$/))
    const moduleFiles = allHtmlFiles.filter(file => file.match(/\.module\.html$/))
    const otherFiles = filteredFiles.filter(file => file.match(/^((?!\.html).)*$/))

    console.log([
      'Found ' + htmlFiles.length + ' html files',
      'Found ' + moduleFiles.length + ' modules',
      'Found ' + otherFiles.length + ' other files'
    ].join('\n') + '\n')

    const warnings = []

    function addWarning (warning) {
      if (warnings.indexOf(warning) === -1) {
        warnings.push(warning)
      }
    }

    Promise.all(moduleFiles.map(mapFile).map(f =>
      fs.readFile(f.src, 'utf8').then((res) => ({ src: f.src, file: res }))
    ))
      .then(res => {
        const modules = res.map(module => ({
          content: removeBreaks(module.file),
          name: getRelativePath(module.src).replace(/module\.html$/, 'html')
        }))

        const mapped = htmlFiles.map(mapFile)

        return Promise.all(mapped.map(f =>
          fs.readFile(f.src, 'utf8')
            .then(res => renderFile(getRelativePath(f.src), removeBreaks(res), modules, addWarning))
            .then(html => ({
              src: f.src,
              dest: f.dest,
              content: Buffer.from(html)
            }))
        ))
      })
      .then(rendered => {
        const mappedOtherFiles = otherFiles.map(mapFile)
        return Promise.all(mappedOtherFiles.map(f =>
          fs.lstat(f.src)
            .then(res => {
              if (res.isFile()) {
                return fs.readFile(f.src)
              }
            })
            .then(content => {
              if (content) {
                return {
                  src: f.src,
                  dest: f.dest,
                  content
                }
              }
            })
        ))
          .then(res => rendered.concat(res.filter(Boolean)))
      })
      .then(files => processPostBuildPlugins(files))
      .then(files => files.map(file => {
        if (!config.ignoreFileNames.find(pattern => minimatch(getRelativePath(file.src), pattern)) || config.ignoreFileNames.length === 0) {
          return Object.assign({}, file, {
            dest: appendTimestampToFileName(file.dest)
          })
        }
        return file
      }))
      .then(files => {
        const fileNames = files
          .filter(file => !file.src.match(/\.html/))
          .map(file => ({
            from: extractFileName(file.src),
            to: extractFileName(file.dest)
          }))
        return files.map(file => {
          if (file.src.match(/\/.+(html|css|js)/)) {
            const next = Object.assign({}, file, {
              content: file.content.toString('utf8')
            })
            fileNames.forEach(fileName => {
              next.content = next.content.replace(
                new RegExp(fileName.from, 'g'),
                fileName.to
              )
            })
            return Object.assign(next, {
              content: Buffer.from(next.content)
            })
          }
          return file
        })
      })
      .then(files => {
        return fs.emptyDir(path.resolve(dirname, config.buildDir))
          .then(() => Promise.all(files.map(file =>
            fs.ensureDir(path.dirname(file.dest))
              .then(() => fs.writeFile(file.dest, file.content))
          )))
      })
      .then(() => {
        if (warnings.length > 0) {
          console.log('Compiled with warnings:')
          warnings.forEach(w => console.log('- ' + w))
        } else {
          console.log('Compiled succesfully!')
        }
        console.timeEnd('Build time')
      })
  })
}

if (watch) {
  nodeWatch(path.resolve(dirname, config.sourceDir), { recursive: true }, function (evt, name) {
    console.log('\n\n%s changed!\n', name)
    build()
  })
}

build()
