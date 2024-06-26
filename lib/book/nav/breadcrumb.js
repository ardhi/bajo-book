function breadcrumb (path, { pages, sections, params, book } = {}) {
  const { getConfig } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { map, find, concat } = this.bajo.helper._
  const [, alias, name, ...paths] = path.split('/')
  const prev = []
  const cfg = getConfig('bajoWebMpa')
  const ns = concat(['bajoBook', cfg.i18n.defaultNs])
  const items = map(paths, p => {
    const curr = concat(prev, [p])
    const currId = '/' + curr.join('/')
    const realId = `/${alias}/${name}${currId}`
    const folder = find(sections, { id: realId })
    const currPage = find(pages, { id: realId })
    const href = routePath(`bajoBook:${currPage.id}`, { params })
    prev.push(p)
    const active = path === folder.id
    const title = params.i18n.t(folder.title, { ns })
    const caption = active ? `${book.meta.hideLevel ? '' : folder.level} ${title}` : title
    return { caption, href, active }
  })
  items.unshift({
    icon: 'home',
    href: routePath(`bajoBook:/${alias}/${name}`, { params }),
    active: false
  })
  return items
}

export default breadcrumb
