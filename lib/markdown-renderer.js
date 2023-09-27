async function renderer () {
  const { getConfig } = this.bajo.helper
  const cfg = getConfig('bajoWebBook')
  return {
    table (header, body) {
      return `
        <table class="${cfg.markdown.tableClass}">
          ${header}
          ${body}
        </table>
        `
    }
  }
}

export default renderer
