import React from "react"
import { storiesOf } from "@storybook/react"
import {
  boomshak,
  camelProps,
  compile,
  BoomshakOptions,
  RegularBackgroundLayer,
  RegularForegroundLayer,
} from "./boomshak"

function Boomshak({
  text,
  layers = undefined,
  lineHeight = 16,
}): React.ReactElement {
  const options: BoomshakOptions = {
    layers,
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

stories.add(`custom layer`, () => (
  <Boomshak
    text="custom"
    layers={[
      {
        ...RegularBackgroundLayer,
        strokeWidth: 1,
      },
      {
        ...RegularForegroundLayer,
        strokeWidth: 0.6,
      },
    ]}
    lineHeight={64}
  />
))

