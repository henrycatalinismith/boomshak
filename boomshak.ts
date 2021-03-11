export type Point = [
  number, // x
  number, // y
]

export type Stroke = Point[]

export type Glyph = Stroke[]

export type CharacterRange =
  | "0" | "1" | "2" | "3" | "4"
  | "5" | "6" | "7" | "8" | "9"

  | "!" | "@" | "#" | "$" | "%"
  | "^" | "&" | "*" | "(" | ")"
  | '"' | "'" | "#" | "+" | "-"
  | "," | "." | "/" | "\\" | ":"
  | ";" | "<" | ">" | "?" | "_"
  | "{" | "}" | "|" | "`" | "~"
  | "[" | "]"

  | "A" | "B" | "C" | "D" | "E"
  | "F" | "G" | "H" | "I" | "J"
  | "K" | "L" | "M" | "N" | "O"
  | "P" | "Q" | "R" | "S" | "T"
  | "U" | "V" | "W" | "X" | "Y"
  | "Z"

  | "a" | "b" | "c" | "d" | "e"
  | "f" | "g" | "h" | "i" | "j"
  | "k" | "l" | "m" | "n" | "o"
  | "p" | "q" | "r" | "s" | "t"
  | "u" | "v" | "w" | "x" | "y"
  | "z"

export type Typeface<T extends string> = {
  [k in T]: Glyph
}

export type ViewBox = [
  number,
  number,
  number,
  number,
]

export interface BoomshakOptions {
  text: string
  layers?: ElementProps[]
  lineHeight?: number
  typeface?: Typeface<string>
  viewBoxFn?: (string) => ViewBox
}

export type ElementName =
  "svg" | "g" | "path"

export interface ElementProps {
  [x: string]: number | string
}

export type ElementChildren = Element[]

export type Element = [
  ElementName,
  ElementProps,
  ElementChildren,
]

export const RegularBackground: ElementProps = {
  fill: "none",
  stroke: "#000000",
  "stroke-width": 2.8,
}

export const RegularForeground: ElementProps = {
  fill: "none",
  stroke: "#fff1e8",
  "stroke-width": 1,
}

export const RegularLayers = [
  RegularBackground,
  RegularForeground,
]

const defaults: Partial<BoomshakOptions> = {
  layers: RegularLayers,
  lineHeight: 16,
  viewBoxFn: calculateViewBox,
}

export function arrayBounce<T>(
  a: T[],
  i: number,
): T {
  const n = a.length - 1
  if (n === 0) {
    return a[0]
  }
  return a[(
    (Math.floor(i / n) % 2 == 0)
    ? i % n
    : n - (i % n)
  )]
}

export function boomshak({
  text,
  layers = defaults.layers,
  lineHeight = defaults.lineHeight,
  typeface = Boomshak,
  viewBoxFn = defaults.viewBoxFn,
}: BoomshakOptions): Element {
  const lines = text.split(/\n/)
  const xm = 2.6
  const viewBox = viewBoxFn(text).join(" ")

  const glyphs = splitChars(
    text,
  ).map(([[x, y], char]): Element => {
    return [
      "g",
      {},
      layers.map(layer => [
        "path",
        {
          ...layer,
          d: renderGlyph(
            typeface[char],
            [x, 2],
          ),
        },
        [],
      ]),
    ]
  })

  const height = lineHeight
  const width = (lineHeight / 4)
    * xm
    * lines[0].length

  const props: ElementProps = {}
  props["viewBox"] = viewBox
  props["stroke-linecap"] = "round"
  props["stroke-linejoin"] = "round"
  props["height"] = `${height}px`
  props["width"] = `${width}px`

  const svg: Element = [
    "svg",
    props,
    glyphs,
  ]

  return svg
}

function calculateViewBox(text: string): ViewBox {
  const xm = 5.2
  const lines = text.split(/\n/)
  let x = -1
  switch (lines[0][0]) {
    case "w": x = -0.46; break
    case "<": x = -0.66; break
  }
  const y = 0
  const w = xm * lines[0].length - 1
  const h = 8 * lines.length
  const viewBox: ViewBox = [
    x,
    y,
    w,
    h,
  ]
  return viewBox
}

function camelCase(string: string): string {
  return string
    .match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g)
    .reduce((result, word, index) => {
      return result + (
        index
        ? word.replace(
          /^([a-z])/,
          c => c.toUpperCase()
        ) : word
      )
    }, "")
}

export function camelProps(
  props: ElementProps
): ElementProps {
  return Object
    .entries(props)
    .map(([k, v]) => [camelCase(k), v])
    .reduce((o, [k, v]) => Object.assign(
      o, { [k]: v }
    ), {})
}

export function compile(
  element: Element,
  fn: (Element, number) => any,
  i = 0,
): any {
  const [
    name,
    props,
    children,
  ] = element
  return fn([
    name,
    props,
    children.map(
      (c,j) => compile(c, fn, j)
    ),
  ], i)
}

export function map(
  typeface: Typeface<string>,
  fn: (Glyph) => Glyph,
): Typeface<string> {
  return Object
    .entries(typeface)
    .map(([k, v]) => [k, fn(v)])
    .reduce((o, [k, v]) => ({
      ...o,
      [k as string]: v,
    }), {})
}

export function max<T = number>(
  l: T[],
  fn = function(n: T): number {
    return n as unknown as number
  }
): number {
  return l.reduce((m, n) => {
    const v = fn(n)
    return v > m ? v : m
  }, -Infinity)
}

export function maxPoints(
  typeface: Typeface<string>,
): number {
  return max<Glyph>(
    Object
      .entries(typeface)
      .map(([char, glyph]) => glyph),
    glyph => max<Stroke>(
      glyph,
      stroke => stroke.length,
    ),
  )
}

export function maxStrokes(
  typeface: Typeface<string>,
): number {
  return max<Glyph>(
    Object
      .entries(typeface)
      .map(([char, glyph]) => glyph),
    glyph => glyph.length,
  )
}

export function padGlyph(
  glyph: Glyph,
  strokeCount: number,
): Glyph {
  return times<Stroke>(
    strokeCount,
    i => arrayBounce(glyph, i),
  )
}

export function padStroke(
  stroke: Stroke,
  pointCount: number,
): Stroke {
  return times<Point>(
    pointCount,
    i => arrayBounce(stroke, i),
  )
}

export function padTypeface(
  typeface: Typeface<string>
): Typeface<string> {
  const points = maxPoints(typeface)
  const strokes = maxStrokes(typeface)
  return map(
    typeface,
    glyph => padGlyph(
      glyph.map(s => padStroke(s, points)),
      strokes
    )
  )
}

export function renderGlyph(
  glyph: Glyph,
  [x = 0, y = 0]: Point,
): string {
  return glyph.map(
    stroke => renderStroke(
      stroke,
      [
        x * 4.8,
        y,
      ],
    )
  ).join(" ")
}

export function renderStroke(
  stroke: Stroke,
  [x = 0, y = 0]: Point,
): string {
  return "M" + stroke.map(
    (p) => [
      p[0] + x,
      p[1] + y,
    ]
  ).join(" L")
}

export function splitChars(
  text: string,
): [Point, string][] {
  return text
    .split(/\n/)
    .map((line, y) => [
      y,
      line.split(""),
    ])
    .map(([y, l]) => (l as string[]).map(
      (c,x) => [x,y,c])
    )
    .flat()
    .map(([x,y,c]) => {
      return [
        [
          x as unknown as number,
          y as unknown as number
        ],
        c as unknown as string,
      ]
    })
}

export function times<T>(
  n: number,
  fn = function(i: number): T {
    return i as unknown as T
  }
): T[] {
  return [...Array(n)].map(
    ($1, i) => fn(i)
  )
}

export const Boomshak: Typeface<CharacterRange> = {
  "0": [
    [
      [0, 0],
      [2, 0],
      [2, 4],
      [0, 4],
      [0, 0],
    ],
  ],

  "1": [
    [
      [0, 0],
      [1, 0],
      [1, 4],
    ],
    [
      [0, 4],
      [2, 4],
    ],
  ],

  "2": [
    [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
      [0, 4],
      [2, 4],
    ],
  ],

  "3": [
    [
      [0, 0],
      [2, 0],
      [2, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [0, 4],
    ],
  ],

  "4": [
    [
      [0, 0],
      [0, 2],
      [2, 2],
    ],
    [
      [2, 0],
      [2, 4],
    ],
  ],

  "5": [
    [
      [2, 0],
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 4],
      [0, 4],
    ],
  ],

  "6": [
    [
      [0, 0],
      [0, 4],
      [2, 4],
      [2, 2],
      [0, 2],
    ],
  ],

  "7": [
    [
      [0, 0],
      [2, 0],
      [2, 4],
    ],
  ],

  "8": [
    [
      [1, 0],
      [0, 0],
      [2, 0],
      [2, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [0, 4],
      [0, 3],
      [1, 2],
      [0, 1],
      [0, 0],
      [1, 0],
    ],
  ],

  "9": [
    [
      [2, 2],
      [0, 2],
      [0, 0],
      [2, 0],
      [2, 4],
    ],
  ],

  "!": [
    [
      [1, 0],
      [1, 2],
    ],
    [
      [1, 4],
      [1, 4],
    ],
  ],

  "@": [
    [
      [2, 4],
      [1, 4],
      [0, 3],
      [0, 1],
      [1, 0],
      [2, 1],
      [2, 2],
    ],
  ],

  '"': [
    [
      [0, 0],
      [0, 1],
    ],
    [
      [2, 0],
      [2, 1],
    ],
  ],

  $: [
    [
      [2, 0.5],
      [1, 0.5],
      [0, 1.5],
      [2, 2.5],
      [1, 3.5],
      [0, 3.5],
    ],
    [
      [1, 0],
      [1, 4],
    ],
  ],

  "%": [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [2, 4],
      [2, 4],
    ],
    [
      [0, 4],
      [2, 0],
    ],
    //path([2,0], [2,1]),
    //path([1,2], [1,2])
  ],

  "&": [
    [
      [2, 4],
      [1, 3],
      [1, 2],
      [1, 0],
      [0, 0],
      [0, 4],
      [1, 4],
      [2, 3],
    ],
    //path([1,2], [1,0], [0,0], [0,4], [2,4], [2,3]),
  ],

  "'": [
    [
      [0, 1],
      [1, 0],
    ],
  ],

  "(": [
    [
      [1, 0],
      [0, 1],
      [0, 3],
      [1, 4],
    ],
  ],

  ")": [
    [
      [1, 0],
      [2, 1],
      [2, 3],
      [1, 4],
    ],
  ],

  "*": [
    [
      [1, 1],
      [1, 3],
    ],
    [
      [0, 2],
      [2, 2],
    ],
    [
      [0, 1],
      [2, 3],
    ],
    [
      [2, 1],
      [0, 3],
    ],
  ],

  "+": [
    [
      [1, 1],
      [1, 3],
    ],
    [
      [0, 2],
      [2, 2],
    ],
  ],

  "#": [
    [
      [0, 1],
      [2, 1],
    ],
    [
      [0, 3],
      [2, 3],
    ],
    [
      [0.5, 0],
      [0.5, 4],
    ],
    [
      [1.5, 0],
      [1.5, 4],
    ],
  ],

  "-": [
    [
      [0, 2],
      [2, 2],
    ],
  ],

  ",": [
    [
      [1, 3],
      [0, 4],
    ],
  ],

  ".": [
    [
      [1, 4],
      [1, 4],
    ],
  ],

  "/": [
    [
      [0, 4],
      [2, 0],
    ],
  ],

  ":": [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 3],
      [1, 3],
    ],
  ],

  ";": [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 3],
      [0, 4],
    ],
  ],

  "<": [
    [
      [2, 0],
      [0, 2],
      [2, 4],
    ],
  ],

  ">": [
    [
      [0, 0],
      [2, 2],
      [0, 4],
    ],
  ],

  "?": [
    [
      [0, 0],
      [2, 0],
      [2, 2],
      [1, 2],
    ],
    [
      [1, 4],
      [1, 4],
    ],
  ],

  "^": [
    [
      [0, 1],
      [1, 0],
      [2, 1],
    ],
  ],

  _: [
    [
      [0, 4],
      [2, 4],
    ],
  ],

  "{": [
    [
      [2, 0],
      [1, 0],
      [1, 4],
      [2, 4],
    ],
    [
      [0, 2],
      [1, 2],
    ],
  ],

  "}": [
    [
      [0, 0],
      [1, 0],
      [1, 4],
      [0, 4],
    ],
    [
      [2, 2],
      [1, 2],
    ],
  ],

  "|": [
    [
      [1, 0],
      [1, 4],
    ],
  ],

  "~": [
    [
      [0, 3],
      [0, 2],
      [2, 2],
      [2, 1],
    ],
  ],

  "`": [
    [
      [1, 0],
      [2, 1],
    ],
  ],

  "[": [
    [
      [1, 0],
      [0, 0],
      [0, 4],
      [1, 4],
    ],
  ],

  "]": [
    [
      [1, 0],
      [2, 0],
      [2, 4],
      [1, 4],
    ],
  ],

  "\\": [
    [
      [0, 0],
      [2, 4],
    ],
  ],

  A: [
    [
      [0, 4],
      [0, 0],
      [2, 0],
      [2, 4],
    ],
    [
      [0, 2],
      [2, 2],
    ],
  ],

  B: [
    [
      [0, 2],
      [0, 4],
      [2, 4],
      [2, 3],
      [1, 2],
      [2, 1],
      [2, 0],
      [0, 0],
      [0, 2],
    ],
  ],

  C: [
    [
      [2, 0],
      [1, 0],
      [0, 1],
      [0, 3],
      [1, 4],
      [2, 4],
    ],
  ],

  D: [
    [
      [2, 2],
      [2, 1],
      [1, 0],
      [0, 0],
      [0, 4],
      [1, 4],
      [2, 3],
      [2, 2],
    ],
  ],

  E: [
    [
      [2, 0],
      [0, 0],
      [0, 4],
      [2, 4],
    ],
    [
      [0, 2],
      [1, 2],
    ],
  ],

  F: [
    [
      [2, 0],
      [0, 0],
      [0, 4],
    ],
    [
      [0, 2],
      [1, 2],
    ],
  ],

  G: [
    [
      [2, 0],
      [1, 0],
      [0, 1],
      [0, 4],
      [2, 4],
      [2, 3],
    ],
  ],

  H: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [2, 0],
      [2, 4],
    ],
    [
      [0, 2],
      [2, 2],
    ],
  ],

  I: [
    [
      [0, 0],
      [2, 0],
    ],
    [
      [0, 4],
      [2, 4],
    ],
    [
      [1, 0],
      [1, 4],
    ],
  ],

  J: [
    [
      [0, 0],
      [2, 0],
    ],
    [
      [0, 4],
      [1, 4],
      [1, 0.1],
    ],
  ],

  K: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 1],
      [2, 0],
    ],
    [
      [1, 2],
      [2, 3],
      [2, 4],
    ],
  ],

  L: [
    [
      [0, 0],
      [0, 4],
      [2, 4],
    ],
  ],

  M: [
    [
      [0, 4],
      [0, 0],
      [1, 1],
      [2, 0],
      [2, 4],
    ],
  ],

  N: [
    [
      [0, 4],
      [0, 0],
      [1, 0],
      [2, 1],
      [2, 4],
    ],
  ],

  O: [
    [
      [0, 2],
      [0, 4],
      [1, 4],
      [2, 3],
      [2, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
  ],

  P: [
    [
      [0, 4],
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ],
  ],

  Q: [
    [
      [2, 4],
      [1, 4],
      [1, 3],
      [0, 3],
      [0, 1],
      [1, 0],
      [2, 1],
      [2, 2],
      [1, 3],
    ],
  ],

  R: [
    [
      [0, 4],
      [0, 0],
      [2, 0],
      [2, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
  ],

  S: [
    [
      [2, 0],
      [1, 0],
      [0, 1],
      [0, 2],
      [2, 2],
      [2, 3],
      [1, 4],
      [0, 4],
    ],
  ],

  T: [
    [
      [0, 0],
      [2, 0],
    ],
    [
      [1, 0],
      [1, 4],
    ],
  ],

  U: [
    [
      [0, 0],
      [0, 3],
      [1, 4],
      [2, 4],
      [2, 0],
    ],
  ],

  V: [
    [
      [0, 0],
      [0, 3],
      [1, 4],
      [2, 3],
      [2, 0],
    ],
  ],

  W: [
    [
      [0, 0],
      [0, 4],
      [1, 3],
      [2, 4],
      [2, 0],
    ],
  ],

  X: [
    [
      [0, 0],
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
    [
      [2, 0],
      [2, 1],
      [1, 2],
      [0, 3],
      [0, 4],
    ],
  ],

  Y: [
    [
      [2, 0],
      [2, 4],
      [0, 4],
    ],
    [
      [0, 0],
      [0, 2],
      [2, 2],
    ],
  ],

  Z: [
    [
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 3],
      [0, 4],
      [2, 4],
    ],
  ],

  a: [
    [
      [0, 4],
      [0, 1],
      [2, 1],
      [2, 4],
    ],
    [
      [0, 3],
      [2, 3],
    ],
  ],

  b: [
    [
      [0, 3],
      [0, 4],
      [2, 4],
      [2, 3],
      [1, 2],
      [1, 1],
      [0, 1],
      [0, 3],
    ],
  ],

  c: [
    [
      [2, 1],
      [0, 1],
      [0, 4],
      [2, 4],
    ],
  ],

  d: [
    //[[0,1], [0,4], [1,4], [2,3], [2,2], [1,1], [0,1]],
    [
      [0, 3],
      [0, 4],
      [1, 4],
      [2, 3],
      [2, 2],
      [1, 1],
      [0, 1],
      [0, 2],
    ],
  ],

  e: [
    [
      [2, 1],
      [0, 1],
      [0, 4],
      [2, 4],
    ],
    [
      [1, 2.5],
      [0, 2.5],
    ],
  ],

  f: [
    [
      [2, 1],
      [0, 1],
      [0, 2],
      [0, 4],
    ],
    [
      [1, 3],
      [0, 3],
    ],
  ],

  g: [
    [
      [2, 1],
      [0, 1],
      [0, 4],
      [2, 4],
      [2, 3],
    ],
  ],

  h: [
    [
      [0, 1],
      [0, 4],
    ],
    [
      [2, 1],
      [2, 4],
    ],
    [
      [0, 3],
      [2, 3],
    ],
  ],

  i: [
    [
      [0, 1],
      [2, 1],
    ],
    [
      [0, 4],
      [2, 4],
    ],
    [
      [1, 1],
      [1, 4],
    ],
  ],

  j: [
    [
      [0, 1],
      [2, 1],
    ],
    [
      [0, 4],
      [1, 4],
      [1, 1],
    ],
  ],

  k: [
    [
      [0, 1],
      [0, 4],
    ],
    [
      [0, 3],
      [2, 1],
    ],
    [
      [1, 2],
      [2, 3],
      [2, 4],
    ],
  ],

  l: [
    [
      [0, 1],
      [0, 4],
      [2, 4],
    ],
  ],

  m: [
    [
      [0, 4],
      [0, 1],
      [1, 2],
      [2, 1],
      [2, 4],
    ],
  ],

  n: [
    [
      [0, 4],
      [0, 1],
      [1, 1],
      [2, 2],
      [2, 4],
    ],
  ],

  o: [
    [
      [0, 3],
      [0, 4],
      [1, 4],
      [2, 3],
      [2, 1],
      [1, 1],
      [0, 2],
      [0, 3],
    ],
  ],

  p: [
    [
      [0, 4],
      [0, 1],
      [2, 1],
      [2, 3],
      [0, 3],
    ],
  ],

  q: [
    [
      [2, 4],
      [1, 4],
      [1, 3],
      [0, 3],
      [0, 2],
      [1, 1],
      [2, 2],
      [1, 3],
    ],
  ],

  r: [
    [
      [0, 4],
      [0, 1],
      [2, 1],
      [2, 2],
      [1, 3],
      [2, 4],
    ],
  ],

  s: [
    [
      [2, 1],
      [1, 1],
      [0, 2],
      [2, 3],
      [1, 4],
      [0, 4],
    ],
  ],

  t: [
    [
      [0, 1],
      [2, 1],
    ],
    [
      [1, 1],
      [1, 4],
    ],
  ],

  u: [
    [
      [0, 1],
      [0, 3],
      [1, 4],
      [2, 4],
      [2, 1],
    ],
  ],

  v: [
    [
      [0, 1],
      [0, 3],
      [1, 4],
      [2, 3],
      [2, 1],
    ],
  ],

  w: [
    [
      [0, 1],
      [0, 4],
      [1, 3],
      [2, 4],
      [2, 1],
    ],
  ],

  x: [
    [
      [0, 1],
      [2, 3],
      [2, 4],
    ],
    [
      [2, 1],
      [0, 3],
      [0, 4],
    ],
  ],

  y: [
    [
      [2, 1],
      [2, 4],
      [0, 4],
    ],
    [
      [0, 1],
      [0, 2],
      [2, 2],
    ],
  ],

  z: [
    [
      [0, 1],
      [2, 1],
      [2, 2],
      [0, 3],
      [0, 4],
      [2, 4],
    ],
  ],
}
