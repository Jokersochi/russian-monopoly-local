import { describe, expect, it } from "vitest";
import { ChartStyle, type ChartConfig } from "./chart";

describe("ChartStyle sanitization", () => {
  it("sanitizes malicious CSS keys, values, and IDs to prevent CSS injection", () => {
    const maliciousConfig: ChartConfig = {
      "desktop}; } body { background: red; } /*": {
        label: "Desktop",
        color: "hsl(12, 34%, 56%); } body { background: red; } /*",
      },
    };

    const maliciousId = "chart-123}\nbody{color:red}";

    const element = ChartStyle({ id: maliciousId, config: maliciousConfig });
    expect(element).not.toBeNull();

    const cssContent = element?.props?.dangerouslySetInnerHTML?.__html || "";

    // Should not contain injected CSS rules or unsafe closing braces/semicolons
    expect(cssContent).not.toContain("body { background: red; }");
    expect(cssContent).not.toContain("body{color:red}");
    expect(cssContent).toContain("[data-chart=chart-123bodycolorred]");
    expect(cssContent).toContain("--color-desktop");
    expect(cssContent).toContain("hsl(12, 34%, 56%)");
  });
});
