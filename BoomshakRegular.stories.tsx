import React from "react"
import { storiesOf } from "@storybook/react"
import { BoomshakRegular } from "./BoomshakRegular.component"

const stories = storiesOf("<BoomshakRegular>", module)

;[64, 32, 16].forEach(fontSize => {
  stories.add(`boomshak [${fontSize}]`, () => (
    <BoomshakRegular
      text="boomshak"
      fontSize={fontSize}
    />
  ))
})

