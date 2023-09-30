async function beforeResourceMerge (plugin, lng, content) {
  const { eachPlugins, readConfig, importPkg } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  if (plugin !== 'bajoWebBook') return
  await eachPlugins(async function ({ file, plugin, dir }) {
    const item = await readConfig(file)
    // const book = file.replace(dir + '/book/', '').split('/')[0]
    merge(content, item)
    // set(content, `${plugin}.${book}`, item)
  }, { glob: 'book/**/*.json' })
}

export default beforeResourceMerge
