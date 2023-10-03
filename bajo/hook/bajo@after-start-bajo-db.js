async function bajoAfterStartBajoDb () {
  const { buildBooks } = this.bajoBook.helper
  await buildBooks()
}

export default bajoAfterStartBajoDb
