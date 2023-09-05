async function rebuild (path, args) {
  const { importPkg, print, importModule, getConfig } = this.bajo.helper
  const { buildBooks } = this.bajoWebBook.helper
  const prompts = await importPkg('bajo-cli:@inquirer/prompts')
  const { confirm } = prompts
  const answer = await confirm({
    message: print.__('You\'re about to rebuild all books. Continue?'),
    default: false
  })
  if (!answer) {
    print.fail('Aborted!')
    process.exit(1)
  }
  const cfg = getConfig('bajoDb', { full: true })
  const start = await importModule(`${cfg.dir}/bajo/start.js`)
  await start.call(this, 'all')
  await buildBooks()
}

export default rebuild
