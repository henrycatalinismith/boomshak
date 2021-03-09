import {
  Element,
  ElementProps,
  Stroke,
  camelProps,
  compile,
  renderStroke,
} from "./boomshak"

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
    const d = renderStroke(stroke)
    expect(d).toBe("M0,1 L0,4")
  })
})
