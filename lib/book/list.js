async function toc (book, req, reply) {
  const { importPkg } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { merge, map } = await importPkg('lodash-es')
  const { arrayToTree } = await importPkg('bajo-extra:performant-array-to-tree')
  const query = { bookId: book.id }
  const sort = { id: 1 }
  let pages = await recordFind('WebBookPage', { query: merge({}, query, { asset: false }), sort })
  pages = map(pages, p => {
    p.caption = p.title
    p.href = routePath('bajoWebBook:' + p.id, { params: { lang: req.lang } })
    delete p.title
    return p
  })
  const tree = arrayToTree(pages, { id: 'id', parentId: 'sectionId', dataField: null })
  return reply.view('bajoWebBook:/book/toc', { book, tree })
}

async function list (ctx, req, reply) {
  const { recordFind } = this.bajoWeb.helper
  const [, plugin, name] = req.params['*'].split('/')
  const query = {}
  if (name) query.id = `/${plugin}/${name}`
  else if (plugin) query.plugin = plugin
  req.query.query = query
  const data = await recordFind({ repo: 'WebBookBook', req })
  if (data.data.length === 1 && name) return await toc.call(this, data.data[0], req, reply)
  return reply.view('bajoWebBook:/book/list', { data })
}

export default list
