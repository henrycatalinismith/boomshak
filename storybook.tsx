import React from "react"
import { storiesOf } from "@storybook/react"
import {
  boomshak,
  camelProps,
  compile,
  BoomshakOptions,
} from "./boomshak"

function Boomshak({
  text,
  lineHeight = 16,
}): React.ReactElement {
  const options: BoomshakOptions = {
    lineHeight,
  }
  const element = boomshak(
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

;[64, 32, 16].forEach(lineHeight => {
  stories.add(`boomshak [${lineHeight}]`, () => (
    <Boomshak
      text="boomshak"
      lineHeight={lineHeight}
    />
  ))
})

;
