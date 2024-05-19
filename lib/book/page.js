import path from 'path'
import breadcrumb from './nav/breadcrumb.js'
import inSections from './nav/in-sections.js'
import getRef from './nav/get-ref.js'
import formatLevel from './format-level.js'

async function download (file, reply) {
  const { fs } = this.bajo.helper
  const stream = fs.createReadStream(file)
  reply.header('Content-Type', 'application/octet-stream')
  reply.send(stream)
}

async function page (ctx, req, reply) {
  const { importPkg, getConfig, fs } = this.bajo.helper
  const { routePath, notFound } = this.bajoWeb.helper
  const { renderString, buildLocals, markdownParse } = this.bajoWebMpa.helper
  const { recordFind, recordGet } = this.bajoDb.helper
  const { doctypes, getRealPageFile } = this.bajoBook.helper
  const { isEmpty, findIndex, merge, map } = this.bajo.helper._
  const matter = await importPkg('bajoWebMpa:gray-matter')
  const paths = req.params['*'].split('/')
  paths.shift()
  const [ns, name] = paths
  const params = { lang: req.lang, i18n: req.i18n }
  const query = { bookId: `/${ns}/${name}` }
  const sort = { level: 1, id: 1 }
  let sections = await recordFind('BookSection', { query, sort })
  sections = map(sections, s => { s.level = formatLevel(s.level); return s })
  let pages = await recordFind('BookPage', { query: merge({}, query, { asset: false }), sort })
  pages = map(pages, p => { p.level = formatLevel(p.level); return p })
  const pageIdx = findIndex(pages, { id: `/${paths.join('/')}` })
  const book = await recordGet('BookBook', `/${ns}/${name}`, { thrownNotFound: false })
  if (pageIdx < 0) {
    if (!book) return notFound(req.url)
    const cfg = getConfig(book.plugin, { full: true })
    const [,, ...items] = paths
    const file = `${cfg.dir.pkg}/bajoBook/book/${name}/${items.join('/')}`
    if (!fs.existsSync(file)) return notFound(req.url)
    await download.call(this, file, reply)
    return
  }
  const page = pages[pageIdx]
  if (page.section) {
    const next = pages[pageIdx + 1]
    await reply.redirectTo(routePath(`bajoBook:${next.id}`, { params }))
  }
  const ext = path.extname(page.id)
  if (!isEmpty(ext) && !doctypes.includes(ext) && page.asset) {
    await download.call(this, page.file, reply)
    return
  }
  const file = getRealPageFile(page.file, book.dir, req.lang)
  let content = fs.readFileSync(file, 'utf8')
  if (path.extname(file) === '.md') {
    const minfo = matter(content)
    content = await markdownParse(minfo.content)
  } else if (path.extname(file) === '.njk') {
    const locals = await buildLocals('bajoBook', {}, req)
    content = await renderString(content, locals)
  }
  const bc = breadcrumb.call(this, page.sectionId, { pages, sections, params, book })
  const items = inSections.call(this, page.sectionId, { pages, sections, params, pageId: page.id, book })
  const ref = await getRef.call(this, page, { params, book })
  return reply.view('bajoBook:/book/page', { book, page, content, breadcrumb: bc, pages: items, ref })
}

export default page
