import handleBooks from '../lib/book/index.js'
import buildIndex from '../lib/build-index.js'
import buildBooks from '../lib/build-books.js'
import markdown from '../lib/markdown.js'

async function boot (ctx) {
  const { getConfig } = this.bajo.helper
  const cfg = getConfig('bajoWebBook')
  const { prefix } = cfg
  await buildIndex.call(this)
  await markdown.call(this)
  await ctx.register(async (childCtx) => {
    await handleBooks.call(this, ctx)
  }, { prefix })
  buildBooks.call(this)
}

export default boot
