import fs from 'fs'

function getPageFile (source, baseDir, lang) {
  const [,, ...pagePaths] = source.replace(baseDir, '').split('/')
  let file = `${baseDir}/i18n/${lang}/pages/${pagePaths.join('/')}`
  if (!fs.existsSync(file)) file = source
  return file
}

export default getPageFile
