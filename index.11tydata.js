const fs = require("fs-extra")
const sass = require("sass")

const package = fs.readJSONSync("package.json")

const { css } = sass.renderSync({
  file: "style.scss",
})

module.exports = {
  css,
  package,
}
