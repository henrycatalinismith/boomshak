const createHtmlElement = require("create-html-element")
const { boomshakRegular } = require("./regular")

function render({
  name,
  props,
  children,
}) {
  return createHtmlElement({
    name,
    attributes: props,
    html: children.map(
      child => render({
        name: child[0],
        props: child[1],
        children: child[2],
      })
    ).join("")
  })
}

module.exports = function(eleventyConfig) {
  console.log("building")
  eleventyConfig.addFilter(
    "boomshakRegular",
    function(text) {
      const [
        name,
        props,
        children,
      ] = boomshakRegular(text)
      const html = render({
        name,
        props,
        children,
      })
      return html
    }
  )
}
