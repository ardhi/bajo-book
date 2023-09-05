import path from 'path'
import matter from 'gray-matter'

// format: book/<bookName>/<chapter>/<section>/<subsection>/<page>
async function getPages (chapter) {
  const { importPkg, titleize, readConfig } = this.bajo.helper
  const { doctypes } = this.bajoWebBook.helper
  const { find, merge, concat } = await importPkg('lodash-es')
  const [fs, fastGlob] = await importPkg('fs-extra', 'fast-glob')
  const files = await fastGlob(`${chapter.dir}/**/*`)
  const pages = []
  const sections = []
  for (const file of files) {
    const ext = path.extname(file)
    let title = titleize(path.basename(file, ext))
    const asset = !doctypes.includes(ext)
    let id = chapter.id + file.replace(chapter.dir, '')
    if (!asset) id = id.slice(0, id.length - ext.length)
    const sectionId = path.dirname(id)
    let minfo = {}
    if (ext === '.md') {
      const md = await fs.readFile(file, 'utf8')
      minfo = matter(md).data
      // TODO: we might need the excerp from parsed matter
    }
    const info = await readConfig(`${path.dirname(file)}/.${path.basename(file, ext)}.*`, { ignoreError: true })
    pages.push(merge({
      id,
      title,
      asset,
      file,
      sectionId: sectionId === chapter.id ? null : sectionId,
      bookId: chapter.bookId,
      chapterId: chapter.id
    }, minfo, info))
    // sections
    if (sectionId !== chapter.id && !find(sections, { id: sectionId })) {
      title = titleize(path.basename(sectionId))
      const info = await readConfig(`${path.dirname(file)}/.${path.basename(file, ext)}.*`, { ignoreError: true })
      sections.push(merge({
        id: sectionId,
        chapterId:
        chapter.id,
        bookId: chapter.bookId,
        title
      }, info))
    }
  }
  this.bajoWebBook.sections = concat(this.bajoWebBook.sections, sections)
  this.bajoWebBook.pages = concat(this.bajoWebBook.pages, pages)
}

async function getChapters (book) {
  const { importPkg, titleize, readConfig } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  const fastGlob = await importPkg('fast-glob')
  const files = await fastGlob(`${book.dir}/*`, { onlyDirectories: true })
  const chapters = []
  for (const file of files) {
    let title = path.basename(file)
    title = titleize(title)
    const id = book.id + file.replace(book.dir, '')
    const info = await readConfig(`${file}/.${path.basename(file)}.*`, { ignoreError: true })
    const chapter = merge({ id, title, dir: file, bookId: book.id }, info)
    chapters.push(chapter)
    await getPages.call(this, chapter)
  }
  this.bajoWebBook.chapters = chapters
}

async function buildBooks () {
  const { readConfig, eachPlugins, importPkg } = this.bajo.helper
  const { merge, omit } = await importPkg('lodash-es')
  this.bajoWebBook.books = []
  this.bajoWebBook.chapters = []
  this.bajoWebBook.sections = []
  this.bajoWebBook.pages = []
  await eachPlugins(async function ({ file, plugin, dir }) {
    const title = path.basename(file)
    const book = {
      id: `/${title}`,
      title,
      plugin,
      dir: file
    }
    const info = await readConfig(`${file}/.${path.basename(file)}.*`, { ignoreError: true })
    merge(book, omit(info, ['plugin', 'dir']))
    this.bajoWebBook.books.push(book)
    await getChapters.call(this, book)
  }, { glob: { pattern: 'book/*', onlyDirectories: true } })
}

export default buildBooks
