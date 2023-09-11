import list from './list.js'
import page from './page.js'

async function book (ctx) {
  const me = this
  const handler = async function (req, reply) {
    const [, ...params] = req.params['*'].split('/')
    if (params.length <= 2) return await list.call(me, this, req, reply)
    return await page.call(me, this, req, reply)
  }
  await ctx.route({ url: '*', handler, method: 'GET' })
}

export default book
