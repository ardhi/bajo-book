---
title: doctypes
---
Lists all supported (page) types. Currently, bajoBook support following types:

- Markdown (*.md)
- HTML (*.html / *.htm)
- Plain text (*.txt)
- Nunjuck file (*.njk)

###### Type

```array```

#### Example

```javascript
...
const { doctypes } = this.bajoBook.helper
console.log(doctypes) // ['.md', '.html', '.htm', '.txt', '.njk']
...
```