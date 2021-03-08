const createHtmlElement = require("create-html-element")
const { boomshak, compile } = require("./boomshak")

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter(
    "boomshak",
    function(text, lineHeight = 32) {
      const element = boomshak({
        text,
        lineHeight,
      })
      const svg = compile(
        element,
        ([name, props, children]) => {
          return createHtmlElement({
            name,
            attributes: props,
            html: children.join(""),
          })
        }
      )
      return svg
    }
  )
}
