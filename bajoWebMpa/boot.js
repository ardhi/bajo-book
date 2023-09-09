import handleBooks from '../lib/book/index.js'
import markdown from '../lib/markdown.js'

async function boot (ctx) {
  const { getConfig } = this.bajo.helper
  const cfg = getConfig('bajoWebBook')
  const { prefix } = cfg
  await markdown.call(this)
  await ctx.register(async (childCtx) => {
    await handleBooks.call(this, childCtx)
  }, { prefix })
}

export default boot
