const chokidar = require("chokidar")
const createHtmlElement = require("create-html-element")
const sass = require("sass")
const { boomshak, compile } = require("./boomshak")

function monkeypatch(cls, fn) {
  const orig = cls.prototype[fn.name][`_PS_original`] || cls.prototype[fn.name]
  function wrapped() {
    return fn.bind(this, orig).apply(this, arguments)
  }
  wrapped[`_PS_original`] = orig
  cls.prototype[fn.name] = wrapped
}

module.exports = function(eleventyConfig) {

  eleventyConfig.addWatchTarget("style.scss")

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

  setImmediate(function() {
    const Eleventy = require("@11ty/eleventy/src/Eleventy.js")
    if (Eleventy.prototype) {
      function watch(original) {
        const watcher = chokidar.watch(["style.scss"], {
          persistent: true,
        })
        const reload = () => () => {
          this.eleventyServe.reload()
        }
        watcher.on("add", reload(this))
        watcher.on("change", reload(this))
        return original.apply(this)
      }
      monkeypatch(Eleventy, watch)
    }
  })

  eleventyConfig.addShortcode(
    "css",
    function() {
      const { css } = sass.renderSync({
        file: "style.scss",
      })
      return css
    }
  )
}
