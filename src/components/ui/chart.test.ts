import { describe, expect, it } from "vitest";
import { sanitizeCssKey, sanitizeCssValue } from "./chart";

describe("ChartStyle CSS Sanitization", () => {
  it("sanitizes CSS keys by removing non-alphanumeric/hyphen characters", () => {
    expect(sanitizeCssKey("primary")).toBe("primary");
    expect(sanitizeCssKey("chart-1")).toBe("chart-1");
    expect(sanitizeCssKey("key; } body { background: red; }")).toBe("keybodybackgroundred");
    expect(sanitizeCssKey("</style><script>alert(1)</script>")).toBe("stylescriptalert1script");
  });

  it("sanitizes CSS color values by keeping valid CSS color chars and stripping potential injections", () => {
    expect(sanitizeCssValue("#ff0000")).toBe("#ff0000");
    expect(sanitizeCssValue("hsl(140, 25%, 92%)")).toBe("hsl(140, 25%, 92%)");
    expect(sanitizeCssValue("hsl(var(--primary) / 0.8)")).toBe("hsl(var(--primary) / 0.8)");
    expect(sanitizeCssValue("red; } </style><script>alert(1)</script>")).toBe("red  /stylescriptalert(1)/script");
    expect(sanitizeCssValue("url('javascript:alert(1)')")).toBe("url(javascriptalert(1))");
  });
});
