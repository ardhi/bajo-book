async function tool ({ path, args = [], returnEarly }) {
  const { currentLoc } = this.bajo.helper
  const { runToolMethod } = this.bajoCli.helper
  await runToolMethod({ path, args, dir: `${currentLoc(import.meta).dir}/tool`, returnEarly })
}

export default tool
