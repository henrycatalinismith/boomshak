import {
  Boomshak,
  Element,
  ElementProps,
  Stroke,
  arrayBounce,
  camelProps,
  compile,
  renderGlyph,
  renderStroke,
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

describe("renderStroke", () => {
  it("generates a shape definition based on the points", () => {
    const stroke: Stroke = [
      [0, 1],
      [0, 4],
    ]
    const d = renderStroke(stroke, [0, 0])
    expect(d).toBe("M0,1 L0,4")
  })

  it("pads the shape definition to the given length", () => {
    const stroke: Stroke = [
      [0, 1],
      [0, 4],
    ]
    const d = renderStroke(stroke, [0, 0], 6)
    expect(d).toBe("M0,1 L0,4 L0,1 L0,4 L0,1 L0,4")
  })

  it("pads the shape definition to the given length", () => {
    const stroke: Stroke = [
      [0, 1],
      [0, 4],
      [1, 2],
    ]
    const d = renderStroke(stroke, [0, 0], 6)
    expect(d).toBe("M0,1 L0,4 L1,2 L0,4 L0,1 L0,4")
  })
})
