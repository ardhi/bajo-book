import { marked } from 'marked'
import extendedTables from 'marked-extended-tables'
import customHeadingId from 'marked-custom-heading-id'
import { mangle } from 'marked-mangle'
import katex from 'marked-katex-extension'
// import emoji from 'marked-emoji'

async function markdown () {
  marked.use(
    extendedTables(),
    customHeadingId(),
    mangle(),
    katex({ throwOnError: false })
  )
  this.bajoWebBook.markdown = marked
}

export default markdown
