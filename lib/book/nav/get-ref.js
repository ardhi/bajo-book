import formatLevel from '../format-level.js'

async function getRef (page, { params, book } = {}) {
  const { importPkg, getConfig } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { isEmpty, map, find, concat } = await importPkg('lodash-es')
  const cfg = getConfig('bajoWebMpa')
  const ns = concat(['bajoBook', cfg.i18n.defaultNs])
  if (isEmpty(page.ref)) return
  const query = { id: { $in: page.ref } }
  let pages = await recordFind('BookPage', { query })
  pages = map(pages, p => { p.level = formatLevel(p.level); return p })
  return map(page.ref, r => {
    const href = r.startsWith('http') ? r : routePath('bajoBook:' + r, { params })
    const p = find(pages, { id: r })
    return { href, caption: p ? ((book.meta.hideLevel ? '' : p.level) + ' ' + params.i18n.t(p.title, { ns })) : r, icon: 'link' }
  })
}

export default getRef
