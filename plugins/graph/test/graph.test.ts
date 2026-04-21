import { describe, expect, it } from "vitest";
import render from "preact-render-to-string";
import Graph from "../src/components/Graph";

describe("Graph Component", () => {
  it("should create a Graph component with default options", () => {
    const component = Graph({});

    expect(component).toBeDefined();
    expect(typeof component).toBe("function");
  });

  it("should create a Graph component with custom options", () => {
    const component = Graph({
      localGraph: {
        depth: 2,
        drag: false,
        zoom: true,
      },
      globalGraph: {
        depth: -1,
        focusOnHover: true,
      },
    });

    expect(component).toBeDefined();
    expect(typeof component).toBe("function");
  });

  it("should export component with css property", () => {
    const component = Graph({});

    expect(component.css).toBeDefined();
    expect(typeof component.css).toBe("string");
  });

  it("should export component with afterDOMLoaded script", () => {
    const component = Graph({});

    expect(component.afterDOMLoaded).toBeDefined();
    expect(typeof component.afterDOMLoaded).toBe("string");
  });

  it("should render with the story wiki heart graph class", () => {
    const component = Graph({});
    const html = render(
      component({
        ctx: {} as any,
        externalResources: {} as any,
        fileData: {} as any,
        cfg: { locale: "en-US" } as any,
        children: [],
        tree: {} as any,
        allFiles: [],
      }),
    );

    expect(html).toContain("graph story-wiki-graph");
    expect(html).toContain("global-graph-container");
  });
});
