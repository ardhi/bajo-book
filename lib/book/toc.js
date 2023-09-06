async function detail (ctx, req, reply) {
  const { importPkg } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { merge, map } = await importPkg('lodash-es')
  const { arrayToTree } = await importPkg('bajo-extra:performant-array-to-tree')
  const [, ...params] = req.params['*'].split('/')
  const filter = { query: { id: `/${params.join('/')}` } }
  const data = await recordFind('WebBookBook', filter)
  if (data.length === 0) {
    reply.callNotFound()
    return
  }
  const book = data[0]
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

export default detail
