async function bajoAfterStartBajoDb () {
  const { buildBooks } = this.bajoWebBook.helper
  await buildBooks()
}

export default bajoAfterStartBajoDb
