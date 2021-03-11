import {
  Element,
  ElementProps,
  Glyph,
  Stroke,
  Typeface,
  arrayBounce,
  camelProps,
  compile,
  map,
  max,
  maxPoints,
  maxStrokes,
  padGlyph,
  padStroke,
  padTypeface,
  renderStroke,
  splitChars,
  times,
} from "./boomshak"

describe("arrayBounce", () => {
  it("wraps an array index back and forth through the array", () => {
    const array = ["a", "b", "c"]
    expect(arrayBounce(array, 0)).toBe("a")
    expect(arrayBounce(array, 1)).toBe("b")
    expect(arrayBounce(array, 2)).toBe("c")
    expect(arrayBounce(array, 3)).toBe("b")
    expect(arrayBounce(array, 4)).toBe("a")
    expect(arrayBounce(array, 5)).toBe("b")
    expect(arrayBounce(array, 6)).toBe("c")
  })
})

describe("camelProps", () => {
  it("transforms kebab-case props to camelCase", () => {
    const kebab: ElementProps = {}
    kebab["stroke-width"] = 8
    const camel = camelProps(kebab)
    expect(camel).toEqual({
      strokeWidth: 8,
    })
  })
})

describe("compile", () => {
  it("passes the root node to the callback", () => {
    const element: Element = [
      "svg", {}, []
    ]
    const fn = jest.fn()
    compile(element, fn)
    expect(fn).toHaveBeenCalledWith(element, 0)
  })

  it("processes leaf nodes first", () => {
    const element: Element = [
      "svg", {}, [
        ["path", {}, []],
      ]
    ]
    const fn = jest.fn()
    compile(element, fn)
    expect(fn.mock.calls[0][0][0]).toBe("path")
    expect(fn.mock.calls[1][0][0]).toBe("svg")
  })
})

describe("map", () => {
  it("runs the fn on the typeface", () => {
    const input: Typeface<string> = {
      a: [
        [[0,0]],
        [[1,1],[1,2]],
      ],
    }
    const fn = function(glyph: Glyph): Glyph {
      return glyph.slice(0, 1)
    }
    expect(map(input, fn)).toEqual({
      a: [
        [[0,0]],
      ],
    })
  })
})

describe("max", () => {
  it("returns the highest number in the list", () => {
    expect(max([1,2,3])).toBe(3)
  })

  it("returns the highest value in the collection", () => {
    interface Thing {
      size: number
    }
    const collection: Thing[] = [
      { size: 2 },
      { size: 4 },
      { size: 8 },
    ]
    const output = max<Thing>(
      collection,
      thing => thing.size,
    )
    expect(output).toBe(8)
  })
})

describe("maxPoints", () => {
  it("determines the largest number of points in any stroke in the typeface", () => {
    const input: Typeface<string> = {
      a: [
        [[0,0]],
      ],
      b: [
        [[1,1],[1,2]],
        [[2,2],[2,3],[2,4]],
      ],
      c: [
        [[3,3],[3,4],[3,5],[3,6]],
        [[4,4],[4,5],[4,6],[4,7]],
        [[5,5],[5,6],[5,7],[5,8],[5,9]],
      ],
    }
    expect(maxPoints(input)).toBe(5)
  })
})

describe("maxStrokes", () => {
  it("determines the largest number of strokes used by any glyph in the typeface", () => {
    const input: Typeface<string> = {
      a: [
        [[0,0],[0,1]],
      ],
      b: [
        [[1,1],[1,2]],
        [[2,2],[2,3]],
      ],
      c: [
        [[3,3],[3,4]],
        [[4,4],[4,5]],
        [[5,5],[5,6]],
      ],
    }
    expect(maxStrokes(input)).toBe(3)
  })
})

describe("padGlyph", () => {
  it("repeats strokes until the given amount", () => {
    const input: Glyph = [
      [[0,0],[0,1]],
      [[1,1],[1,2]],
    ]
    const output = padGlyph(input, 4)
    expect(output).toEqual([
      [[0,0],[0,1]],
      [[1,1],[1,2]],
      [[0,0],[0,1]],
      [[1,1],[1,2]],
    ])
  })
})

describe("padStroke", () => {
  it("repeats points until the given amount", () => {
    const input: Stroke = [[0,0],[0,1]]
    const output = padStroke(input, 4)
    expect(output).toEqual([
      [0,0],[0,1],[0,0],[0,1],
    ])
  })
})

describe("padTypeface", () => {
  it("pads all glyphs to have the same number of strokes", () => {
    const input: Typeface<string> = {
      a: [
        [[0,0],[0,1]],
        [[1,1],[1,2]],
      ],
      b: [
        [[2,2],[2,3]],
        [[3,3],[3,4]],
        [[4,4],[4,5]],
      ],
      c: [
        [[5,5],[5,6]],
        [[6,6],[6,7]],
        [[7,7],[7,8]],
        [[8,8],[8,9]],
      ],
    }
    const output = padTypeface(input)
    expect(output).toEqual({
      a: [
        [[0,0],[0,1]],
        [[1,1],[1,2]],
        [[0,0],[0,1]],
        [[1,1],[1,2]],
      ],
      b: [
        [[2,2],[2,3]],
        [[3,3],[3,4]],
        [[4,4],[4,5]],
        [[3,3],[3,4]],
      ],
      c: [
        [[5,5],[5,6]],
        [[6,6],[6,7]],
        [[7,7],[7,8]],
        [[8,8],[8,9]],
      ],
    })
  })

  it("pads all strokes to have the same number of points", () => {
    const input: Typeface<string> = {
      b: [
        [[1,1],[1,2]],
        [[2,2],[2,3],[2,4]],
      ],
      c: [
        [[3,3],[3,4],[3,5],[3,6]],
        [[4,4],[4,5],[4,6],[4,7],[4,8]],
      ],
    }
    const output = padTypeface(input)
    expect(output).toEqual({
      b: [
        [[1,1],[1,2],[1,1],[1,2],[1,1]],
        [[2,2],[2,3],[2,4],[2,3],[2,2]],
      ],
      c: [
        [[3,3],[3,4],[3,5],[3,6],[3,5]],
        [[4,4],[4,5],[4,6],[4,7],[4,8]],
      ],
    })
  })

})

describe("renderStroke", () => {
  it("generates a shape definition based on the points", () => {
    const stroke: Stroke = [
      [0, 1],
      [0, 4],
    ]
    const d = renderStroke(stroke, [0, 0])
    expect(d).toBe("M0,1 L0,4")
  })
})

describe("chars", () => {
  it("returns the chars as a flat list", () => {
    expect(splitChars("abc")).toEqual([
      [[0,0], "a"],
      [[1,0], "b"],
      [[2,0], "c"],
    ])
  })
})

describe("times", () => {
  it("returns numbers", () => {
    expect(times(3)).toEqual([0,1,2])
  })

  it("returns strings", () => {
    expect(times(3, String)).toEqual(["0","1","2"])
  })

  it("runs the fn", () => {
    interface Thing {
      size: number
    }
    const fn = function(i): Thing {
      return {
        size: (i+1) * 2,
      }
    }
    const output = times<Thing>(2, fn)
    expect(output).toEqual([
      {size:2},
      {size:4},
    ])
  })
})
