const createHtmlElement = require("create-html-element")
const { boomshakRegular, compile } = require("./boomshak")

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter(
    "boomshakRegular",
    function(text, fontSize = 32) {
      const options = {
        fontSize,
      }
      const element = boomshakRegular(
        text,
        options,
      )
      const svg = compile(
        element,
        ([name, attributes, html]) => {
          return createHtmlElement({
            name,
            attributes,
            html,
          })
        }
      )
      return svg
    }
  )
}
