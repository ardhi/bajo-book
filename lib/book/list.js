async function toc (book, req, reply) {
  const { importPkg, getConfig } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { merge, map, concat } = await importPkg('lodash-es')
  const { arrayToTree } = await importPkg('bajo-extra:performant-array-to-tree')
  const cfg = getConfig('bajoWebMpa')
  const ns = concat(['bajoWebBook', cfg.i18n.defaultNs])
  const query = { bookId: book.id }
  const sort = { level: 1, id: 1 }
  let pages = await recordFind('WebBookPage', { query: merge({}, query, { asset: false }), sort })
  pages = map(pages, p => {
    p.caption = p.level + ' ' + req.i18n.t(p.title, { ns })
    p.href = routePath('bajoWebBook:' + p.id, { params: { lang: req.lang } })
    return p
  })
  const tree = arrayToTree(pages, { id: 'id', parentId: 'sectionId', dataField: null })
  if (['flat', 'nested'].includes(req.query.list)) req.session.bookToc = req.query.list
  if (!req.session.bookToc) req.session.bookToc = 'flat'
  return reply.view('bajoWebBook:/book/toc', { book, pages, tree, list: req.session.bookToc })
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
  if (['bullet', 'gridsmall', 'grid'].includes(req.query.list)) req.session.bookList = req.query.list
  if (!req.session.bookList) req.session.bookList = 'grid'
  return reply.view('bajoWebBook:/book/list', { data, list: req.session.bookList })
}

export default list
