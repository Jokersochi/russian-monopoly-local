import { describe, expect, it } from "vitest";
import { ChartStyle } from "./chart";

describe("ChartStyle component security sanitization", () => {
  it("sanitizes dynamic id, config key, and color values rendered in inline style tag", () => {
    const element = ChartStyle({
      id: "chart-1; } body { display: none; }",
      config: {
        "desktop;bad": {
          color: "red; } body { display: none; }",
        },
        mobile: {
          color: "hsl(140 25% 92%)",
        },
      },
    });

    expect(element).not.toBeNull();
    const html = element?.props.dangerouslySetInnerHTML.__html;

    // Verify sanitized chart ID in selector
    expect(html).toContain("[data-chart=chart-1bodydisplaynone]");
    expect(html).not.toContain("chart-1; } body { display: none; }");

    // Verify sanitized CSS variable key
    expect(html).toContain("--color-desktopbad:");

    // Verify sanitized CSS color value
    expect(html).toContain("--color-desktopbad: red  body  display none ;");
    expect(html).not.toContain("red; } body { display: none; }");

    // Verify legitimate color formats like hsl are preserved
    expect(html).toContain("--color-mobile: hsl(140 25% 92%);");
  });
});
