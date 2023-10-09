import getBookAndPlugin from '../lib/get-book-plugin.js'
import path from 'path'

let keys = []

function addMetaParent (item) {
  const parent = path.dirname(item)
  if (parent !== '.') {
    if (!keys.includes(parent)) {
      keys = keys.sort()
      keys.push(parent)
    }
    addMetaParent(parent)
  }
}

async function rereadMetadata (_, args) {
  const { print, importPkg, readJson, getConfig } = this.bajo.helper
  const [fg, fs] = await importPkg('fast-glob', 'fs-extra')
  const { set, get, isEmpty, filter } = await importPkg('lodash-es')
  const { doctypes } = this.bajoBook.helper
  const { bookPath, bookId } = await getBookAndPlugin.call(this, args)
  const config = getConfig()
  let resetPages = get(config, 'reset.pages')
  if (isEmpty(resetPages)) resetPages = true
  const mfile = `${bookPath}/${bookId}/.metadata.json`
  const metadata = await readJson(mfile)
  metadata.pages = resetPages ? {} : (metadata.pages ?? {})
  const files = await fg(`${bookPath}/${bookId}/pages/**/*.{${doctypes.map(t => t.slice(1)).join(',')}}`)
  for (const f of files) {
    let base = f.replace(`${bookPath}/${bookId}/pages`, '')
    base = base.replace(path.extname(f), '').slice(1)
    addMetaParent(base)
    keys.push(base)
  }
  keys = keys.sort()
  let counter = 1
  let last
  let levels = []
  for (const k of keys) {
    const parts = k.split('/')
    const lparts = last ? last.split('/') : []
    if (parts.length === lparts.length) {
      levels[parts.length - 1] = counter
    } else if (parts.length < lparts.length) {
      counter = 1
      const arr = filter(keys, key => {
        return key.split('/').length === parts.length
      }).sort()
      const idx = arr.indexOf(k)
      const item = metadata.pages[arr[idx - 1]].level.split('.').map(i => parseInt(i))
      item[parts.length - 1] = item[parts.length - 1] + 1
      levels = item
    } else {
      counter = 1
      levels = [...levels, counter]
    }
    last = k
    counter++
    let val = get(metadata, `pages.${k}`, {})
    if (resetPages) val = { level: levels.join('.') }
    set(metadata.pages, k, val)
  }
  await fs.outputJson(mfile, metadata, { spaces: 2 })
  print.succeed('Done!')
}

export default rereadMetadata
