async function getRef (page, { params } = {}) {
  const { importPkg } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { isEmpty, map, find } = await importPkg('lodash-es')
  if (isEmpty(page.ref)) return
  const query = { id: { $in: page.ref } }
  const pages = await recordFind('WebBookPage', { query })
  return map(page.ref, r => {
    const href = r.startsWith('http') ? r : routePath('bajoWebBook:' + r, { params })
    const p = find(pages, { id: r })
    return { href, caption: p ? p.title : r, icon: 'link' }
  })
}

export default getRef
