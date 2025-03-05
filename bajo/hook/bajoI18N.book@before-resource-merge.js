async function beforeResourceMerge (lng, content) {
  const { eachPlugins, readConfig } = this.bajo.helper
  const { merge } = this.bajo.helper._
  await eachPlugins(async function ({ file, ns, dir }) {
    const item = await readConfig(file, { ns })
    merge(content, item)
  }, { glob: 'book/**/*.json', ns: 'bajoBook' })
}

export default beforeResourceMerge
