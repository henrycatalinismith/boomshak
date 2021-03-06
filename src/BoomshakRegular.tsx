import React from "react"
import { boomshakRegular, BoomshakRegularOptions } from "./boomshakRegular"

export interface BoomshakRegularProps {
  children: string,
  fontSize?: number,
}

function Render({ children }) {
  const [name, props, grandchildren] = children
  let c = undefined
  if (grandchildren.length > 0) {
    c = grandchildren.map(r => <Render>{r}</Render>)
  }
  return React.createElement(name, props, c)
}

export function BoomshakRegular({
  children,
  fontSize = 16,
}: BoomshakRegularProps): React.ReactElement {
  const options: BoomshakRegularOptions = {
    fontSize,
  }
  const data = boomshakRegular(children, options)
  return <Render>{data}</Render>
}

