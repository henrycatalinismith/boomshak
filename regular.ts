import { Glyph, Glyphs, Stroke } from "./glyphs"

export interface BoomshakRegularOptions {
  fontSize?: number,
}

const defaults: BoomshakRegularOptions = {
  fontSize: 16,
}

export interface Props {
  [x: string]: number | string
}

export type Element = [
  string,
  Props,
  Element[],
]

const fg = "#ffffff"
const bg = "#000000"

function renderGlyph(
  glyph: Glyph,
  x: number,
): Element {
  const xScale = 4.8
  return [
    "g",
    {},
    [
      ...glyph.map(stroke => renderStroke(
        stroke,
        x * xScale,
        2,
        0.5,
        bg,
        1.4,
      )),
      ...glyph.map(stroke => renderStroke(
        stroke,
        x * xScale,
        2,
        0.5,
        fg,
        0.5,
      )),
    ],
  ]
}

function renderStroke(
  points: Stroke,
  x: number,
  y: number,
  scale: number,
  color: string,
  width: number,
): Element {
  return [
    "path",
    {
      d: `M${points.map((p) => [
          scale * (p[0] + x),
          scale * (p[1] + y),
        ]).join(" L")}`,
      fill: "none",
      stroke: color,
      "stroke-width": width,
    },
    [],
  ]
}

export function boomshakRegular(
  text: string,
  options = defaults,
): any {
  const lines = text.split(/\n/)
  const xm = 2.6

  const first = (() => {
    switch (lines[0][0]) {
      case "w":
        return -0.23
      case "<":
        return -0.33
      default:
        return -0.5
    }
  })()

  const last = (() => {
    if (text === "<") {
      return 0.33
    }
    return 0
  })()

  const viewBox = [
    first,
    0,
    xm * lines[0].length - 1 + last,
    4 * lines.length,
  ].join(" ")

  const glyphs: any[] = []
  lines.forEach((line, y) => {
    const chars = line.split("")
    chars.forEach((char, x) => {
      glyphs.push(renderGlyph(
        Glyphs[char],
        x,
      ))
    })
  })

  const props: any = {
    viewBox,
  }

  props["stroke-linecap"] = "round"
  props["stroke-linejoin"] = "round"

  props.height = `${options.fontSize}px`
  props.width = `${(options.fontSize / 4) * xm * lines[0].length}px`

  const svg = [
    "svg",
    props,
    glyphs,
  ]

  return svg
}
