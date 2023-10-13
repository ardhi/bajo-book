async function beforeResourceMerge (plugin, lng, content) {
  const { eachPlugins, readConfig, importPkg } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  if (plugin !== 'bajoBook') return
  await eachPlugins(async function ({ file, plugin, dir }) {
    const item = await readConfig(file)
    merge(content, item)
  }, { glob: 'book/**/*.json' })
}

export default beforeResourceMerge
