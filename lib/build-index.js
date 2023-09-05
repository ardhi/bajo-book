import path from 'path'

async function buildIndex () {
  const { titleize, eachPlugins, importPkg } = this.bajo.helper
  const { doctypes } = this.bajoWebBook.helper
  const { find, orderBy, filter, map } = await importPkg('lodash-es')

  const folders = []
  const pages = []
  const books = []
  await eachPlugins(async function ({ file, plugin, dir }) {
    if (!books.includes(plugin)) books.push(plugin)
    const ext = path.extname(file)
    let [pageTitle, pageLevel] = path.basename(file, ext).split('@')
    pageTitle = titleize(pageTitle)
    pageLevel = parseInt(pageLevel) || 9999
    const asset = !doctypes.includes(ext)
    let page = file.replace(dir + '/page', '')
    if (!asset) page = page.slice(0, page.length - ext.length)
    const folder = path.dirname(page)
    let [folderTitle, folderLevel] = path.basename(folder).split('@')
    folderTitle = titleize(folderTitle)
    folderLevel = parseInt(folderLevel) || 9999
    if (!find(folders, { plugin, folder })) {
      const item = { folder, plugin, title: folderTitle, level: folderLevel }
      folders.push(item)
    }
    if (!find(pages, { plugin, file })) {
      const item = { file, plugin, page, folder, title: pageTitle, level: pageLevel, asset }
      pages.push(item)
    }
  }, { glob: 'page/**/*' })
  this.bajoWebBook.books = map(books, b => {
    return {
      plugin: b,
      folders: orderBy(filter(folders, { plugin: b }), ['plugin', 'level', 'folder', 'title']),
      pages: orderBy(filter(pages, { plugin: b }), ['plugin', 'level', 'page', 'title'])
    }
  })
}

export default buildIndex
