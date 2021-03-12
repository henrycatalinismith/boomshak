const fs = require("fs-extra")
const _ = require("lodash")
const fromMarkdown = require("mdast-util-from-markdown")

const package = fs.readJSONSync("package.json")
const markdown = fs.readFileSync("readme.md", "utf-8")

const tree = fromMarkdown(markdown)

const abstract = _.find(
  tree.children,
  child => child.type === "html"
    && child.value.includes('itemprop="abstract"')
).value

const readme = {
  abstract,
}

module.exports = {
  package,
  readme,
}
