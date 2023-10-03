async function inSections (path, { pages, sections, params, pageId } = {}) {
  const { importPkg, getConfig } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { filter, map, concat } = await importPkg('lodash-es')
  const cfg = getConfig('bajoWebMpa')
  const ns = concat(['bajoBook', cfg.i18n.defaultNs])

  const items = map(filter(pages, { sectionId: path, asset: false }), p => {
    return {
      caption: p.level + ' ' + params.i18n.t(p.title, { ns }),
      icon: p.section ? 'directory' : 'file',
      // active: pageId === p.id,
      href: routePath(`bajoBook:${p.id}`, { params })
    }
  })
  return items
}

export default inSections
