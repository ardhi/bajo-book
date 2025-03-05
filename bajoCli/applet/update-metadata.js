import getBookPathAndPlugin from '../lib/get-book-path-and-plugin.js'

async function rereadMetadata (_, args) {
  const { print, getConfig } = this.bajo.helper
  const { get, isEmpty } = this.bajo.helper._
  const { rereadMetadata } = this.bajoBook.helper
  const { bookPath } = await getBookPathAndPlugin.call(this, args)
  const config = getConfig()
  let resetPages = get(config, 'reset.pages')
  if (isEmpty(resetPages)) resetPages = true
  await rereadMetadata({ bookPath, resetPages })
  print.succeed('Done!')
}

export default rereadMetadata
