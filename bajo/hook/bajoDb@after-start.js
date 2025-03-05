async function bajoDbAfterStart () {
  const { buildBooks } = this.bajoBook.helper
  await buildBooks()
}

export default bajoDbAfterStart
