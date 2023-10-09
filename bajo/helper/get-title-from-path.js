const getTitleFromPath = (item) => {
  const [prefix, ...params] = item.split('-')
  if (!isNaN(parseInt(prefix[0])) && params.length > 0) params.join('-')
  return item
}

export default getTitleFromPath
