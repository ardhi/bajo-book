import path from 'path'

const recs = ['book', 'section', 'page']
const rec = {}
for (const r of recs) {
  rec[r] = []
}
let metadata = {}

async function setLevel (level = '') {
  const { importPkg } = this.bajo.helper
  const { padStart } = await importPkg('lodash-es')
  const [...levels] = (level + '').split('.')
  for (const i in levels) {
    levels[i] = padStart(levels[i], 4, '0')
  }
  return levels.join('.')
}

async function getPages (book) {
  const { importPkg, titleize } = this.bajo.helper
  const { doctypes, getTitleFromPath, rereadMetadata } = this.bajoBook.helper
  const { find, merge, concat, isEmpty } = await importPkg('lodash-es')
  const [fs, fastGlob, matter] = await importPkg('fs-extra', 'fast-glob', 'bajo-web-mpa:gray-matter')
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
      sitem.level = await setLevel.call(this, sitem.level)
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
      item.level = await setLevel.call(this, item.level)
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
    item.level = await setLevel.call(this, item.level)
    pages.push(item)
  }
  rec.section = concat(rec.section, sections)
  rec.page = concat(rec.page, pages)
}

async function save () {
  const { pascalCase } = this.bajo.helper
  const { recordClear, recordCreate } = this.bajoDb.helper
  const opts = { skipHook: true }
  for (const r of recs) {
    const repo = pascalCase(`book ${r}`)
    await recordClear(repo, opts)
    for (const item of rec[r]) {
      await recordCreate(repo, item, opts)
    }
  }
}

async function buildBooks (progress) {
  const { readConfig, eachPlugins, importPkg } = this.bajo.helper
  const { merge, omit } = await importPkg('lodash-es')
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
