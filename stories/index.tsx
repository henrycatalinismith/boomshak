import React from "react"
import { storiesOf } from "@storybook/react"
import { BoomshakRegular } from "../src"

const stories = storiesOf("<BoomshakRegular />", module)

;[64, 32, 16].forEach(fontSize => {
  stories.add(`boomshak [${fontSize}]`, () => (
    <BoomshakRegular fontSize={fontSize}>
      boomshak
    </BoomshakRegular>
  ))
})

