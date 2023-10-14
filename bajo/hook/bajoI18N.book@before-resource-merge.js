async function beforeResourceMerge (lng, content) {
  const { eachPlugins, readConfig, importPkg } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  await eachPlugins(async function ({ file, plugin, dir }) {
    const item = await readConfig(file)
    merge(content, item)
  }, { glob: 'book/**/*.json', ns: 'bajoBook' })
}

export default beforeResourceMerge
