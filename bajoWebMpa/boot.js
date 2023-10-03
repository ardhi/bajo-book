import handleBooks from '../lib/book/index.js'

async function boot (ctx) {
  const { getConfig } = this.bajo.helper
  const cfg = getConfig('bajoBook')
  const { prefix } = cfg
  await ctx.register(async (childCtx) => {
    await handleBooks.call(this, childCtx)
  }, { prefix })
}

export default boot
