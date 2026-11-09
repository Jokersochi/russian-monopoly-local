import { describe, expect, it } from 'vitest';
import { sanitizeCssKey, sanitizeCssValue } from './chart';

describe('Chart CSS Sanitization', () => {
  it('sanitizes CSS keys by removing invalid characters', () => {
    expect(sanitizeCssKey('color-primary')).toBe('color-primary');
    expect(sanitizeCssKey('color; } body { display: none; }')).toBe('colorbodydisplaynone');
  });

  it('sanitizes CSS values while allowing valid CSS color syntax', () => {
    expect(sanitizeCssValue('#ff0000')).toBe('#ff0000');
    expect(sanitizeCssValue('hsl(var(--primary))')).toBe('hsl(var(--primary))');
    expect(sanitizeCssValue('hsl(120 100% 50% / 0.5)')).toBe('hsl(120 100% 50% / 0.5)');
    expect(sanitizeCssValue('red; } <script>alert(1)</script>')).toBe('red  scriptalert(1)/script');
    expect(sanitizeCssValue('red; } body { display: none; }')).toBe('red  body  display none ');
  });
});
