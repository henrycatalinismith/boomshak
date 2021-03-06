import { Glyphs } from "./glyphs"

export interface BoomshakRegularOptions {
  fontSize?: number,
}

const defaults: BoomshakRegularOptions = {
  fontSize: 16,
}

const fg = "#ffffff"
const bg = "#000000"

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

  const glyphs = []
  lines.forEach((line, y) => {
    const chars = line.split("")
    chars.forEach((char, x) => {
      const xScale = 4.8

      const layers = [
        {
          scale: 0.5,
          color: bg,
          x: x * xScale,
          y: 2,
          width: 1.4,
        },
        {
          scale: 0.5,
          color: fg,
          x: x * xScale,
          y: 2,
          width: 0.5,
        },
      ].map((layer, i) => {

        const d = (points, layer) =>
          `M${points
            .map((p) => [
              layer.scale * (p[0] + layer.x),
              layer.scale * (p[1] + layer.y),
            ])
            .join(" L")}`
        const strokes = Glyphs[char] || []

        const paths = strokes.map((stroke, j) => {
          return [
            "path",
            {
              d: d(stroke, layer),
              fill: "none",
              stroke: layer.color,
              strokeWidth: layer.width,
            },
            [],
          ]
        })

        return [
          "g",
          {},
          paths,
        ]
      })

      glyphs.push([
        "g",
        {},
        layers,
      ])
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

