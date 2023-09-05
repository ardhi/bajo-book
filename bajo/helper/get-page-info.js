async function getPageInfo (name, { folders, pages } = {}) {
  const { importPkg, breakNsPath, error } = this.bajo.helper
  const { find } = await importPkg('lodash-es')
  const [plugin, path] = breakNsPath(name)

  if (!folders) folders = this.bajoWebBook.folders
  if (!pages) pages = this.bajoWebBook.pages
  let page = find(pages, { plugin, page: path })
  let redirect = false
  if (!page) {
    const folder = find(folders, { plugin, folder: path })
    if (folder) page = find(pages, { plugin, folder: folder.folder, asset: false })
    if (page) redirect = true
    else throw error('Page not found', { statusCode: 404 })
  }
  const folder = find(folders, { folder: page.folder })
  return { page, folder, redirect }
}

export default getPageInfo
