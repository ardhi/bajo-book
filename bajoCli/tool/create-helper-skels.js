async function generateContent (name, item) {
  const { importPkg } = this.bajo.helper
  const { isArray, isFunction, isPlainObject } = await importPkg('lodash-es')
  const results = ['---']
  let type = ''
  if (isArray(item)) type = 'array'
  else if (isFunction(item)) {
    if (item.constructor.name === 'AsyncFunction') type = 'async function'
    else type = 'function'
  } else if (isPlainObject(item)) type = 'object'
  results.push(`title: ${type} ${name}${isFunction(item) ? '()' : ''}`, '---')
  results.push('\n###### Parameters:\n')
  results.push('| Name | Type | Default Value | Description |')
  results.push('| ---- | ---- | ------------- | ----------- |')
  results.push('\n###### Returns:\n')
  results.push('\n#### Example\n')
  return results.join('\n')
}

async function createHelperSkels (path, args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, keys, map, last, kebabCase, without } = await importPkg('lodash-es')
  const [fs, fastGlob, select, input] = await importPkg('fs-extra', 'fast-glob',
    'bajo-cli:@inquirer/select', 'bajo-cli:@inquirer/input')
  let [plugin, bookId, helperPath] = args
  const config = getConfig()
  const plugins = without(keys(this), 'dump')
  if (isEmpty(plugin)) {
    plugin = await select({
      message: print.__('Please select a plugin:'),
      choices: map(plugins, p => ({ value: p }))
    })
  }
  if (isEmpty(plugin)) print.fatal('You must select a plugin first')
  if (!this[plugin]) print.fatal('Invalid plugin \'%s\'', plugin)
  const cfg = getConfig(plugin, { full: true })
  if (keys(this[plugin].helper).length === 0) print.fatal('Plugin doesn\'t have any helper')
  const bookPath = `${cfg.dir.pkg}/bajoBook/book`
  const dirs = await fastGlob(`${bookPath}/*`, { onlyDirectories: true })
  if (dirs.length === 0) print.fatal('No book found for plugin \'%s\'', plugin)
  const books = map(dirs, d => d.replace(bookPath, '').slice(1))
  if (isEmpty(bookId)) {
    bookId = await select({
      message: print.__('Please select a book id:'),
      choices: map(books, b => ({ value: b }))
    })
  }
  if (!books.includes(bookId)) print.fatal('Invalid book ID \'%s\'', bookId)
  helperPath = await input({
    message: print.__('Please enter a root directory for helper pages, INCLUDING its level:'),
    default: helperPath ?? '2-api/2.2-helper'
  })
  if (isEmpty(helperPath)) print.fatal('You must enter a root directory for helper pages first')
  const dir = `${bookPath}/${bookId}/pages/${helperPath}`
  if (fs.existsSync(dir)) print.warn('Directory \'%s\' already exist', dir)
  const baseLevel = last(helperPath.split('/')).split('-')[0]
  let i = 0
  for (const name in this[plugin].helper) {
    i++
    const level = `${baseLevel}.${i}`
    const basename = `${level}-${kebabCase(name)}.md`
    const file = `${dir}/${basename}`
    if (fs.existsSync(file) && !config.force) {
      print.fail('File for helper \'%s\' exist already, won\'t overwrite without --force', name)
      continue
    }
    const content = await generateContent.call(this, name, this[plugin].helper[name])
    await fs.outputFile(file, content, 'utf8')
    print.succeed('Writing to \'%s\'', dir.replace(bookPath, '') + '/' + basename)
  }
  print.succeed('Done!')
}

export default createHelperSkels
