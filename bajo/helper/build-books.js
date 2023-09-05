import path from 'path'
import matter from 'gray-matter'

// format: book/<bookName>/<chapter>/<section>/<subsection>/<page>

const recs = ['book', 'section', 'page']
const rec = {}
for (const r of recs) {
  rec[r] = []
}

async function getPages (book) {
  const { importPkg, titleize, readConfig } = this.bajo.helper
  const { doctypes } = this.bajoWebBook.helper
  const { find, merge, concat } = await importPkg('lodash-es')
  const [fs, fastGlob] = await importPkg('fs-extra', 'fast-glob')
  const files = await fastGlob(`${book.dir}/**/*`)
  const pages = []
  const sections = []
  for (const file of files) {
    const ext = path.extname(file)
    const asset = !doctypes.includes(ext)
    let id = book.id + file.replace(book.dir, '')
    if (!asset) id = id.slice(0, id.length - ext.length)
    const sectionId = path.dirname(id)
    let minfo = {}
    if (ext === '.md') {
      const md = await fs.readFile(file, 'utf8')
      minfo = matter(md).data
      // TODO: we might need the excerp from parsed matter
    }
    // sections
    if (sectionId !== book.id && !find(sections, { id: sectionId })) {
      const title = titleize(path.basename(sectionId))
      const info = await readConfig(`${path.dirname(file)}/.${path.basename(file, ext)}.*`, { ignoreError: true })
      sections.push(merge({
        id: sectionId,
        bookId: book.id,
        title
      }, info))
      const parentId = path.dirname(sectionId)
      pages.push({
        id: sectionId,
        title,
        file,
        asset: false,
        section: true,
        sectionId: parentId === book.id ? null : parentId,
        bookId: book.id
      })
    }
    // pages
    const info = await readConfig(`${path.dirname(file)}/.${path.basename(file, ext)}.*`, { ignoreError: true })
    pages.push(merge({
      id,
      title: titleize(path.basename(file, ext)),
      asset,
      section: false,
      file,
      sectionId,
      bookId: book.id
    }, minfo, info))
  }
  rec.section = concat(rec.section, sections)
  rec.page = concat(rec.page, pages)
}

async function save () {
  const { pascalCase } = this.bajo.helper
  const { recordClear, recordCreate } = this.bajoDb.helper
  const opts = { skipHook: true }
  for (const r of recs) {
    const repo = pascalCase(`web book ${r}`)
    await recordClear(repo, opts)
    for (const body of rec[r]) {
      await recordCreate(repo, body, opts)
    }
  }
}

async function buildBooks (progress) {
  const { readConfig, eachPlugins, importPkg } = this.bajo.helper
  const { merge, omit } = await importPkg('lodash-es')
  await eachPlugins(async function ({ file, plugin, dir, alias }) {
    const title = path.basename(file)
    const book = {
      id: `/${alias}/${title}`,
      title,
      plugin,
      dir: file
    }
    const info = await readConfig(`${file}/.${path.basename(file)}.*`, { ignoreError: true })
    merge(book, omit(info, ['plugin', 'dir']))
    rec.book.push(book)
    await getPages.call(this, book)
    await save.call(this)
  }, { glob: { pattern: 'book/*', onlyDirectories: true } })
}

export default buildBooks
