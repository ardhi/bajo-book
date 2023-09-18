async function breadcrumb (path, { pages, sections, params } = {}) {
  const { importPkg } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { map, find, concat } = await importPkg('lodash-es')
  const [, ns, name, ...paths] = path.split('/')
  const prev = []
  const items = map(paths, p => {
    const curr = concat(prev, [p])
    const currId = '/' + curr.join('/')
    const realId = `/${ns}/${name}${currId}`
    const folder = find(sections, { id: realId })
    const currPage = find(pages, { id: realId })
    const href = routePath(`bajoWebBook:${currPage.id}`, { params })
    prev.push(p)
    return { caption: folder.title, href, active: path === folder.id }
  })
  items.unshift({
    icon: 'listColumn',
    href: routePath(`bajoWebBook:/${ns}/${name}`, { params }),
    active: false
  })
  return items
}

export default breadcrumb
