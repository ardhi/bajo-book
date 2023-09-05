async function tool ({ path, args = [] }) {
  const { currentLoc } = this.bajo.helper
  const { runToolMethod } = this.bajoCli.helper
  await runToolMethod({ path, args, dir: `${currentLoc(import.meta).dir}/tool` })
}

export default tool
