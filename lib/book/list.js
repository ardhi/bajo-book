import formatLevel from './format-level.js'

async function toc (book, req, reply) {
  const { importPkg, getConfig } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { merge, map, concat } = this.bajo.helper._
  const { arrayToTree } = await importPkg('bajoExtra:performant-array-to-tree')
  const cfg = getConfig('bajoWebMpa')
  const ns = concat(['bajoBook', cfg.i18n.defaultNs])
  const query = { bookId: book.id }
  const sort = { level: 1, id: 1 }
  let pages = await recordFind('BookPage', { query: merge({}, query, { asset: false }), sort, limit: 10000 })
  pages = map(pages, p => {
    p.level = formatLevel(p.level)
    if (!book.meta.hideLevel) p.prefix = p.level
    p.caption = req.i18n.t(p.title, { ns })
    p.href = routePath('bajoBook:' + p.id, { params: { lang: req.lang } })
    return p
  })
  const tree = arrayToTree(pages, { id: 'id', parentId: 'sectionId', dataField: null })
  if (['flat', 'nested'].includes(req.query.list)) req.session.bookToc = req.query.list
  if (!req.session.bookToc) req.session.bookToc = 'flat'
  return reply.view('bajoBook:/book/toc', { book, pages, tree, list: req.session.bookToc })
}

async function list (req, reply) {
  const { recordFind } = this.bajoWeb.helper
  const { isEmpty, omit } = this.bajo.helper._
  const [, plugin, name] = req.params['*'].split('/')
  const query = {}
  if (name) query.id = `/${plugin}/${name}`
  else if (plugin) query.plugin = plugin
  if (!isEmpty(query)) {
    req.query.query = query
    const data = await recordFind({ coll: 'BookBook', req })
    if (data.data.length === 1 && name) return await toc.call(this, data.data[0], req, reply)
  }
  if (!isEmpty(req.query.list)) req.session.bookList = req.query.list
  if (!req.session.bookList) req.session.bookList = 'grid'
  const data = await recordFind({ coll: 'BookBook', req })
  return reply.view('bajoBook:/book/list', { data: data.data, params: omit(data, ['data']), list: req.session.bookList })
}

export default list
