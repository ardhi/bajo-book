async function inSections (path, { pages, sections, params, pageId } = {}) {
  const { importPkg } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { filter, map } = await importPkg('lodash-es')

  const items = map(filter(pages, { sectionId: path, asset: false }), p => {
    return {
      caption: p.level + ' ' + p.title,
      icon: p.section ? 'directory' : 'file',
      // active: pageId === p.id,
      href: routePath(`bajoWebBook:${p.id}`, { params })
    }
  })
  return items
}

export default inSections
