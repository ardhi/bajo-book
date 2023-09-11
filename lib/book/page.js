import path from 'path'
import matter from 'gray-matter'
import breadcrumb from './nav/breadcrumb.js'
import inSections from './nav/in-sections.js'
import getRef from './nav/get-ref.js'

async function page (ctx, req, reply) {
  const { importPkg } = this.bajo.helper
  const { redirectTo, routePath, notFound } = this.bajoWeb.helper
  const { recordFind } = this.bajoDb.helper
  const { doctypes } = this.bajoWebBook.helper
  const { isEmpty, findIndex, merge } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  const paths = req.params['*'].split('/')
  paths.shift()
  const [ns, name] = paths
  const params = { lang: req.lang }
  const query = { bookId: `/${ns}/${name}` }
  const sort = { id: 1 }
  const sections = await recordFind('WebBookSection', { query, sort })
  const pages = await recordFind('WebBookPage', { query: merge({}, query, { asset: false }), sort: { id: 1 } })
  const pageIdx = findIndex(pages, { id: `/${paths.join('/')}` })
  if (pageIdx < 0) return notFound(req.url)
  const page = pages[pageIdx]
  const ext = path.extname(page.id)
  if (page.section) {
    const next = pages[pageIdx + 1]
    redirectTo(routePath(`bajoWebBook:${next.id}`, { params }))
  }
  if (!isEmpty(ext) && !doctypes.includes(ext)) {
    const stream = fs.createReadStream(page.file)
    reply.header('Content-Type', 'application/octet-stream')
    reply.send(stream)
    return
  }
  let content = fs.readFileSync(page.file, 'utf8')
  if (path.extname(page.file) === '.md') {
    const minfo = matter(content)
    content = await this.bajoWebBook.markdown.parse(minfo.content, { async: true })
  }
  const bc = await breadcrumb.call(this, page.sectionId, { pages, sections, params })
  const items = await inSections.call(this, page.sectionId, { pages, sections, params, pageId: page.id })
  const ref = await getRef.call(this, page, { params })
  return reply.view('bajoWebBook:/book/page', { page, content, breadcrumb: bc, pages: items, ref })
}

export default page
