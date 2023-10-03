import path from 'path'

const recs = ['book', 'section', 'page']
const rec = {}
for (const r of recs) {
  rec[r] = []
}
let metadata = {}

function getTitleFromPath (item) {
  const [prefix, ...params] = item.split('-')
  if (!isNaN(parseInt(prefix[0]))) return params.join('-')
  return item
}

function trimLevels (file, dir) {
  file = file.replace(dir, '')
  const parts = file.split('/')
  for (const i in parts) {
    const [, ...items] = parts[i].split('-')
    parts[i] = items.join('-')
  }
  return parts.join('/')
}

async function setLevel (level) {
  const { importPkg } = this.bajo.helper
  const { padStart } = await importPkg('lodash-es')
  const [...levels] = level.split('.')
  for (const i in levels) {
    levels[i] = padStart(levels[i], 4, '0')
  }
  return levels.join('.')
}

async function getPages (book) {
  const { importPkg, titleize } = this.bajo.helper
  const { doctypes } = this.bajoBook.helper
  const { find, merge, concat } = await importPkg('lodash-es')
  const [fs, fastGlob, matter] = await importPkg('fs-extra', 'fast-glob', 'bajo-web-mpa:gray-matter')
  const pagesDir = `${book.dir}/pages`
  const files = (await fastGlob(`${pagesDir}/**/*`)).sort()
  const pages = []
  const sections = []
  for (const file of files) {
    let id = book.id + trimLevels(file, pagesDir)
    let [level, ...bases] = path.basename(file).split('-')
    level = await setLevel.call(this, level)
    let [sectionLevel] = path.basename(path.dirname(file)).split('-')
    sectionLevel = await setLevel.call(this, sectionLevel)
    id = `${path.dirname(id)}/${bases.join('-')}`
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
      const extra = metadata.pages[path.dirname(fileBase)] ?? {}
      sections.push(merge({
        id: sectionId,
        bookId: book.id,
        level: sectionLevel,
        title
      }, extra))
      const parentId = path.dirname(sectionId)
      pages.push(merge({
        id: sectionId,
        title,
        file,
        level: sectionLevel,
        asset: false,
        section: true,
        sectionId: parentId === book.id ? undefined : parentId,
        bookId: book.id
      }, extra))
    }
    // pages
    const extra = metadata.pages[fileBase] ?? {}
    pages.push(merge({
      id,
      title: titleize(getTitleFromPath(path.basename(file, ext))),
      asset,
      section: false,
      file,
      level,
      sectionId,
      bookId: book.id
    }, extra, extraMatter))
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
