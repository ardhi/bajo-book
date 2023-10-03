async function createBook (path, args) {
  const { importPkg, print, getConfig } = this.bajo.helper
  const { isEmpty, keys, map, kebabCase, without } = await importPkg('lodash-es')
  const [fs, select, input] = await importPkg('fs-extra', 'bajo-cli:@inquirer/select',
    'bajo-cli:@inquirer/input')
  let [plugin, bookName, author] = args
  const plugins = without(keys(this), 'dump')
  if (isEmpty(plugin)) {
    plugin = await select({
      message: print.__('Please select a plugin:'),
      choices: map(plugins, p => ({ value: p }))
    })
  }
  if (isEmpty(plugin)) print.fatal('You must select a plugin first')
  if (!this[plugin]) print.fatal('Invalid plugin \'%s\'', plugin)
  bookName = await input({
    message: print.__('Please enter a book name:'),
    default: bookName
  })
  if (isEmpty(bookName)) print.fatal('You must enter a book name first')
  const cfg = getConfig(plugin, { full: true })
  const cfgBook = getConfig('bajoBook', { full: true })
  const dir = `${cfg.dir.pkg}/bajoBook/book/${kebabCase(bookName)}`
  if (fs.existsSync(dir)) print.fatal('Book \'%s\' already exist', dir)
  author = await input({
    message: print.__('Please enter author info:')
  })
  const spinner = print.bora('Creating a book...').start()
  const file = 'open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering.jpg'
  await fs.ensureDir(dir)
  await fs.copy(`${cfgBook.dir.pkg}/bajoBook/book/doc/${file}`, `${dir}/${file}`)
  await fs.writeJson(`${dir}/.metadata.json`, {
    title: bookName,
    author,
    meta: {
      coverImage: 'open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering.jpg',
      coverImageAttr: '<a href="https://www.freepik.com/free-photo/open-book-icon-symbol-yellow-background-education-bookstore-concept-3d-rendering_24803422.htm">Image by mamewmy</a> on Freepik'
    }
  }, { spaces: 2 })
  spinner.succeed('Done!')
}

export default createBook
