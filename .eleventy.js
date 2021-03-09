const chokidar = require("chokidar")
const createHtmlElement = require("create-html-element")
const sass = require("sass")
const {
  boomshak,
  compile,
  renderStroke,
  Glyphs,
} = require("./boomshak")

function monkeypatch(cls, fn) {
  const orig = cls.prototype[fn.name][`_PS_original`] || cls.prototype[fn.name]
  function wrapped() {
    return fn.bind(this, orig).apply(this, arguments)
  }
  wrapped[`_PS_original`] = orig
  cls.prototype[fn.name] = wrapped
}

function compileBoomshak(
  options,
  transform = e => e,
) {
  return compile(
    transform(boomshak(options)),
    ([name, props, children]) => {
      return createHtmlElement({
        name,
        attributes: props,
        html: children.join(""),
      })
    }
  )
}

function animation() {
  return compileBoomshak({
    text: "b",
    viewBoxFn: () => [
      -14,
      -26,
      64,
      64,
    ],
  }, e => {
    const o = renderStroke(
      Glyphs["o"][0],
      0,
    )

    e[2][0][2] = e[2][0][2].map((c, i) => {
      /*
        <animate
          xlink:href="#p1"
          attributeName="d"
          attributeType="XML"
          from="M 100 100 A 200 400 30 1 0 600 200 a 300 100 45 0 1 -300 200"
          to="M 300 600 A 300 400 -20 1 0 400 200 a 200 600 -50 0 1 100 400"
          dur="10s"
          fill="freeze"
        />
      */
      console.log(c)
      console.log(o)
      const props = {
        ...c[1],
        id: `p${i}`,
      }

      const children = [
        [
          "animate",
          {
            "xlink:href": `#p${i}`,
            "attributeName": "d",
            "attributeType": "XML",
            "from": c[1].d,
            "to": o,
            "dur": `${Math.pow(2, 10)}ms`,
            "repeatCount": "indefinite",
          },
          [],
        ]
      ]

      return [
        c[0],
        props,
        children,
      ]
    })
    console.log(e[2][0][2])
    return e
  })
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

  eleventyConfig.addShortcode(
    "header",
    function() {
      return animation()
    }
  )

}
