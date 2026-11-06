## 2025-05-10 - Dynamic CSS Parameter Injection in Chart Component
**Vulnerability:** Direct string interpolation of chart config keys and color values into raw <style dangerouslySetInnerHTML> blocks allowed potential CSS injection and HTML context escape.
**Learning:** Dynamic CSS property names and values rendered inside inline <style> elements must be strictly sanitized using character whitelists to prevent malicious style injection.
**Prevention:** Always sanitize dynamic keys and values using whitelist regex patterns like [^\w-] and [^\w\s#.,()%/-] before rendering them in dangerouslySetInnerHTML style tags.
