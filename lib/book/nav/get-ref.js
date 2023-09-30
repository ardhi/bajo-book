async function getRef (page, { params } = {}) {
  const { importPkg, getConfig } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { isEmpty, map, find, concat } = await importPkg('lodash-es')
  const cfg = getConfig('bajoWebMpa')
  const ns = concat(['bajoWebBook', cfg.i18n.defaultNs])
  if (isEmpty(page.ref)) return
  const query = { id: { $in: page.ref } }
  const pages = await recordFind('WebBookPage', { query })
  return map(page.ref, r => {
    const href = r.startsWith('http') ? r : routePath('bajoWebBook:' + r, { params })
    const p = find(pages, { id: r })
    return { href, caption: p ? (p.level + ' ' + params.i18n.t(p.title, { ns })) : r, icon: 'link' }
  })
}

export default getRef
