async function inSections (path, { pages, sections, params, pageId } = {}) {
  const { importPkg } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { filter, map, concat } = await importPkg('lodash-es')

  const folders = map(filter(sections, item => {
    const isLength = item.id.split('/').length === (path.split('/').length + 1)
    const isFolder = item.id.startsWith(path)
    return isFolder && isLength
  }), f => {
    return {
      caption: f.title,
      icon: 'directory',
      href: routePath(`bajoWebBook:${f.id}`, { params })
    }
  })
  const items = map(filter(pages, { sectionId: path, section: false }), p => {
    return {
      caption: p.title,
      icon: 'file',
      // active: pageId === p.id,
      href: routePath(`bajoWebBook:${p.id}`, { params })
    }
  })
  return concat(folders, items)
}

export default inSections
