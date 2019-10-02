#! /usr/bin/env node

const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const nodeWatch = require('node-watch')

const dirname = process.cwd()
const flag = process.argv[2]

if (process.argv.length > 3 || (flag && flag !== '--watch')) {
  throw new Error('Recieved unknown flags. The only legal flag is --watch. Used that or don\'t use flags.')
}

const watch = flag === '--watch'

let config = {
  sourceDir: 'src',
  buildDir: 'build'
}

try {
  const customConfig = fs.readJsonSync(path.resolve(dirname, 'config.json'))

  Object.assign(config, customConfig)

  console.log('(Using custom config)\n')
} catch (e) {
  console.log('(Using default config)\n')
}

function mapFile (file) {
  const src = path.resolve(dirname, file)
  const dest = path.resolve(dirname, file.replace(new RegExp('^' + config.sourceDir), config.buildDir))
  return {
    src,
    dest
  }
}

function renderFile (src, modules, addWarning) {
  return fs.readFile(src, 'utf8')
    .then(res => {
      const rendered = res.replace(/<module>(.*)<\/module>/g, function (match, p1) {
        const inferred = modules.find(m => m.name === p1)
        if (inferred) {
          if (inferred.content.match(/<module>(.*)<\/module>/g)) {
            addWarning('Module ' + inferred.name + ' contains illegal <module> tag. Ignored it, but it should be removed.')
          }

          return inferred.content
        }

        addWarning('Unknown module: ' + p1)
        return ''
      })
      return rendered
    })
}

function build () {
  console.time('Build time')

  glob(config.sourceDir + '/*', function (err, files) {
    if (err) {
      throw err
    }

    const allHtmlFiles = files.filter(file => file.match(/\.html$/))
    const htmlFiles = allHtmlFiles.filter(file => !file.match(/\.module\.html$/))
    const moduleFiles = allHtmlFiles.filter(file => file.match(/\.module\.html$/))
    const otherFiles = files.filter(file => file.match(/^((?!\.html).)*$/))

    console.log([
      'Found ' + htmlFiles.length + ' html files',
      'Found ' + moduleFiles.length + ' modules',
      'Found ' + otherFiles.length + ' other files',
    ].join('\n') + '\n')

    const warnings = []

    function addWarning (warning) {
      if (warnings.indexOf(warning) === -1) {
        warnings.push(warning)
      }
    }

    fs.emptyDir(path.resolve(dirname, config.buildDir))
      .then(() => {
        const mapped = otherFiles.map(mapFile)
        return Promise.all(mapped.map(f => fs.copy(f.src, f.dest)))
      })
      .then(() => {
        const mapped = moduleFiles.map(mapFile)

        return Promise.all(mapped.map(f =>
          fs.readFile(f.src, 'utf8').then((res) => ({ src: f.src, file: res }))
        ))
      })
      .then(res => {
        const modules = res.map(module => ({
          content: module.file,
          name: path.basename(module.src).replace(/module\.html$/, 'html')
        }))

        const mapped = htmlFiles.map(mapFile)

        return Promise.all(mapped.map(f =>
          renderFile(f.src, modules, addWarning)
            .then(html => fs.writeFile(f.dest, html, 'utf8'))
        ))
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
  nodeWatch(path.resolve(dirname, config.sourceDir), { recursive: true }, function(evt, name) {
    console.log('\n\n%s changed!\n', name);
    build()
  })

  build()
} else {
  build()
}
