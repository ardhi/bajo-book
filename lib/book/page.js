import path from 'path'
import matter from 'gray-matter'
import breadcrumb from './nav/breadcrumb.js'
import inSections from './nav/in-sections.js'
import getRef from './nav/get-ref.js'

async function download (file, reply) {
  const { importPkg } = this.bajo.helper
  const fs = await importPkg('fs-extra')
  const stream = fs.createReadStream(file)
  reply.header('Content-Type', 'application/octet-stream')
  reply.send(stream)
}

async function page (ctx, req, reply) {
  const { importPkg, getConfig } = this.bajo.helper
  const { redirectTo, routePath, notFound } = this.bajoWeb.helper
  const { renderString, buildLocals } = this.bajoWebMpa.helper
  const { recordFind, recordGet } = this.bajoDb.helper
  const { doctypes } = this.bajoWebBook.helper
  const { isEmpty, findIndex, merge } = await importPkg('lodash-es')
  const fs = await importPkg('fs-extra')
  const paths = req.params['*'].split('/')
  paths.shift()
  const [ns, name] = paths
  const params = { lang: req.lang }
  const query = { bookId: `/${ns}/${name}` }
  const sort = { level: 1, id: 1 }
  const sections = await recordFind('WebBookSection', { query, sort })
  const pages = await recordFind('WebBookPage', { query: merge({}, query, { asset: false }), sort })
  const pageIdx = findIndex(pages, { id: `/${paths.join('/')}` })
  const book = await recordGet('WebBookBook', `/${ns}/${name}`, { thrownNotFound: false })
  if (pageIdx < 0) {
    if (!book) return notFound(req.url)
    const cfg = getConfig(book.plugin, { full: true })
    const [,, ...items] = paths
    const file = `${cfg.dir}/bajoWebBook/book/${name}/${items.join('/')}`
    if (!fs.existsSync(file)) return notFound(req.url)
    await download.call(this, file, reply)
    return
  }
  const page = pages[pageIdx]
  if (page.section) {
    const next = pages[pageIdx + 1]
    redirectTo(routePath(`bajoWebBook:${next.id}`, { params }))
  }
  const ext = path.extname(page.id)
  if (!isEmpty(ext) && !doctypes.includes(ext) && page.asset) {
    await download.call(this, page.file, reply)
    return
  }
  let content = fs.readFileSync(page.file, 'utf8')
  if (path.extname(page.file) === '.md') {
    const minfo = matter(content)
    content = await this.bajoWebBook.markdown.parse(minfo.content, { async: true })
  } else if (path.extname(page.file) === '.njk') {
    const locals = await buildLocals('bajoWebBook', {}, req)
    content = await renderString(content, locals)
  }
  const bc = await breadcrumb.call(this, page.sectionId, { pages, sections, params })
  const items = await inSections.call(this, page.sectionId, { pages, sections, params, pageId: page.id })
  const ref = await getRef.call(this, page, { params })
  return reply.view('bajoWebBook:/book/page', { book, page, content, breadcrumb: bc, pages: items, ref })
}

export default page
