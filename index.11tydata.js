const fs = require("fs-extra")
const package = fs.readJSONSync("package.json")

module.exports = {
  package,
}
