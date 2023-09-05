async function list (ctx, req, reply) {
  const { recordFind } = this.bajoWeb.helper
  const [, plugin] = req.params['*'].split('/')
  const query = {}
  if (plugin) query.plugin = plugin
  req.query.query = query
  const data = await recordFind({ repo: 'WebBookBook', req })
  return reply.view('bajoWebBook:/book/list', { data })
}

export default list
