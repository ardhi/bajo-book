import path from 'path'

const recs = ['book', 'section', 'page']
const rec = {}
for (const r of recs) {
  rec[r] = []
}
let metadata = {}

function setLevel (level = '') {
  const { padStart } = this.bajo.helper._
  const [...levels] = (level + '').split('.')
  for (const i in levels) {
    levels[i] = padStart(levels[i], 4, '0')
  }
  return levels.join('.')
}

async function getPages (book) {
  const { fastGlob, importPkg, fs, titleize } = this.bajo.helper
  const { doctypes, getTitleFromPath, rereadMetadata } = this.bajoBook.helper
  const { find, merge, concat, isEmpty } = this.bajo.helper._
  const matter = await importPkg('bajoWebMpa:gray-matter')
  if (isEmpty(metadata.pages)) {
    metadata = await rereadMetadata({ resetPages: true, bookPath: book.dir })
  }
  const pagesDir = `${book.dir}/pages`
  const files = (await fastGlob(`${pagesDir}/**/*`)).sort()
  const pages = []
  const sections = []
  for (const file of files) {
    let id = book.id + file.replace(pagesDir, '')
    const ext = path.extname(id)
    let fileBase = file.replace(`${book.dir}/pages/`, '')
    const asset = !doctypes.includes(ext)
    if (!asset) {
      id = id.slice(0, id.length - ext.length)
      fileBase = fileBase.slice(0, fileBase.length - ext.length)
    }
    const sectionId = path.dirname(id)
    let extraMatter = {}
    if (ext === '.md') {
      const md = await fs.readFile(file, 'utf8')
      extraMatter = matter(md).data
      // TODO: we might need the excerp from parsed matter
    }
    // sections
    if (sectionId !== book.id && !find(sections, { id: sectionId })) {
      const title = titleize(getTitleFromPath(path.basename(sectionId)))
      const [,,, ...paths] = sectionId.split('/')
      const extra = metadata.pages[paths.join('/')] ?? {}
      const sitem = merge({
        id: sectionId,
        bookId: book.id,
        title
      }, extra)
      sitem.level = setLevel.call(this, sitem.level)
      sections.push(sitem)
      const parentId = path.dirname(sectionId)
      const item = merge({
        id: sectionId,
        title,
        file,
        asset: false,
        section: true,
        sectionId: parentId === book.id ? undefined : parentId,
        bookId: book.id
      }, extra)
      item.level = setLevel.call(this, item.level)
      pages.push(item)
    }
    // pages
    const [,,, ...paths] = id.split('/')
    const extra = metadata.pages[paths.join('/')] ?? {}
    const item = merge({
      id,
      title: titleize(getTitleFromPath(path.basename(file, ext))),
      asset,
      section: false,
      file,
      sectionId,
      bookId: book.id
    }, extra, extraMatter)
    item.level = setLevel.call(this, item.level)
    pages.push(item)
  }
  rec.section = concat(rec.section, sections)
  rec.page = concat(rec.page, pages)
}

async function save () {
  const { pascalCase } = this.bajo.helper
  const { collClear, recordCreate } = this.bajoDb.helper
  const opts = { noHook: true, noCache: true }
  for (const r of recs) {
    const coll = pascalCase(`book ${r}`)
    await collClear(coll, opts)
    for (const item of rec[r]) {
      await recordCreate(coll, item, opts)
    }
  }
}

async function buildBooks (progress) {
  const { readConfig, eachPlugins } = this.bajo.helper
  const { merge, omit } = this.bajo.helper._
  await eachPlugins(async function ({ file, plugin, dir, alias }) {
    metadata = {}
    const title = path.basename(file)
    const book = {
      id: `/${alias}/${title}`,
      title,
      plugin,
      dir: file
    }
    metadata = (await readConfig(`${file}/.metadata.*`, { ignoreError: true })) ?? {}
    merge(book, omit(metadata.book, ['plugin', 'dir']))
    metadata.book = metadata.book ?? {}
    metadata.pages = metadata.pages ?? {}
    rec.book.push(book)
    await getPages.call(this, book)
  }, { glob: { pattern: 'book/*', onlyDirectories: true }, useBajo: true })
  await save.call(this)
}

export default buildBooks
