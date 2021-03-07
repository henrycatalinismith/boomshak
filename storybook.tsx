import React from "react"
import { storiesOf } from "@storybook/react"
import {
  boomshakRegular,
  camelProps,
  compile,
  BoomshakRegularOptions,
} from "./boomshak"

function BoomshakRegular({
  text,
  fontSize = 16,
}): React.ReactElement {
  const options: BoomshakRegularOptions = {
    fontSize,
  }
  const element = boomshakRegular(
    text,
    options,
  )
  return compile(
    element,
    ([name, props, children], i) => {
      return React.createElement(
        name,
        {
          key: i,
          ...camelProps(props)
        },
        children,
      )
    }
  )
}

const stories = storiesOf("boomshak", module)

;[64, 32, 16].forEach(fontSize => {
  stories.add(`regular [${fontSize}]`, () => (
    <BoomshakRegular
      text="boomshak"
      fontSize={fontSize}
    />
  ))
})

