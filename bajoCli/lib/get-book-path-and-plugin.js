async function getBookPathAndPlugin (args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, keys, map, without } = await importPkg('lodash-es')
  const [fastGlob, select] = await importPkg('fast-glob', 'bajo-cli:@inquirer/select')
  let [plugin, bookId] = args
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
  let bookPath = `${cfg.dir.pkg}/bajoBook/book`
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
  bookPath = `${bookPath}/${bookId}`
  return { plugin, bookPath }
}

export default getBookPathAndPlugin
