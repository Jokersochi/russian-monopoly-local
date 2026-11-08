import { describe, expect, it } from "vitest";
import { sanitizeCssKey, sanitizeCssValue } from "./chart";

describe("Chart CSS sanitization", () => {
  it("sanitizes keys to only allow word characters and hyphens", () => {
    expect(sanitizeCssKey("desktop")).toBe("desktop");
    expect(sanitizeCssKey("chart-primary-1")).toBe("chart-primary-1");
    expect(sanitizeCssKey('evil"; } body { display: none; } /*')).toBe("evilbodydisplaynone");
    expect(sanitizeCssKey("prop<script>alert(1)</script>")).toBe("propscriptalert1script");
  });

  it("sanitizes CSS values to strip unsafe injection sequences", () => {
    expect(sanitizeCssValue("#ff0000")).toBe("#ff0000");
    expect(sanitizeCssValue("hsl(210, 40%, 98%)")).toBe("hsl(210, 40%, 98%)");
    expect(sanitizeCssValue("rgb(255, 0, 0)")).toBe("rgb(255, 0, 0)");
    expect(sanitizeCssValue("red; } body { background: url('http://evil.com'); }")).toBe(
      "red  body  background url(http//evil.com) ",
    );
    expect(sanitizeCssValue("expression(alert('XSS'))")).toBe("expression(alert(XSS))");
    expect(sanitizeCssValue('</style><script>alert(1)</script>')).toBe("/stylescriptalert(1)/script");
  });
});
