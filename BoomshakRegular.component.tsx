import _ from "lodash"
import React from "react"
import {
  boomshakRegular,
  BoomshakRegularOptions,
} from "./regular"

export interface BoomshakRegularProps {
  text: string,
  fontSize?: number,
}

function Render({
  name,
  props,
  children = [],
}) {
  return React.createElement(
    name,
    _.mapKeys(
      props,
      (_1, key) => _.camelCase(key)
    ),
    children.map(
      (child, i) => React.createElement(
        Render,
        {
          key: i,
          name: child[0],
          props: child[1],
        },
        child[2],
      )
    )
  )
}

export function BoomshakRegular({
  text,
  fontSize = 16,
}: BoomshakRegularProps): React.ReactElement {
  const options: BoomshakRegularOptions = {
    fontSize,
  }
  const [
    name,
    props,
    children,
  ] = boomshakRegular(
    text,
    options,
  )
  return React.createElement(
    Render,
    { name, props, children },
  )
}
