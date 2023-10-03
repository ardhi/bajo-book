function formatLevel (level) {
  const [...levels] = level.split('.')
  for (const i in levels) {
    levels[i] = parseInt(levels[i])
  }
  return levels.join('.')
}

export default formatLevel
