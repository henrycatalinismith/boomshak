const chokidar = require("chokidar")
const createHtmlElement = require("create-html-element")
const fs = require("fs-extra")
const sass = require("sass")
const {
  boomshak,
  compile,
  padTypeface,
  renderGlyph,
  Boomshak,
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

const images = {}

images.animation = function() {
  const dur = Math.pow(2, 7)
  const gap = Math.pow(2, 9)
  const typeface = padTypeface(Boomshak)
  const chars = "9876543210AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz".split("")
  const paths = chars.map(l => {
    const y = l.match(/[a-z]/)
      ? 1.5
      : 2
    return renderGlyph(
      typeface[l],
      [0,y],
    )
  })

  const viewBoxFn = () => [
    -3,
    -0.10,
    8,
    8,
  ]

  const animate = (i, j) => {
    const props = {}
    props.attributeName = "d"
    props.attributeTypes = "XML"
    props.fill = "freeze"
    props.repeatCount = 1

    props.begin = `${((j+1) * dur) + (j * gap)}ms`
    props.dur = `${dur}ms`
    props.from = paths[j]
    props.to = paths[j+1]
    props.id = `a${i}${j}`
    props["xlink:href"] = `#p${i}`

    return [
      "animate",
      props,
      [],
    ]
  }

  const animatePath = ([name, props], i) => {
    props.id = `p${i}`
    return [
      name,
      props,
      chars
        .slice(1)
        .map((c, j) => animate(i, j)),
    ]
  }

  const transform = ([name, props, children]) => {
    children[0][2] = children[0][2].map((c, i) => {
      return animatePath(c, i)
    })
    return [
      name,
      props,
      children,
    ]
  }

  return compileBoomshak({
    text: chars[0],
    typeface,
    viewBoxFn,
  }, transform)
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
      return images.animation()
    }
  )

  fs.ensureDirSync("_site")
  Object
    .entries(images)
    .forEach(([name, fn]) => {
      fs.writeFileSync(
        `_site/${name}.svg`,
        fn()
      )
    })
}
