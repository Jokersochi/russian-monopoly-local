## 2025-05-15 - Unbiased CSPRNG for Game Logic
**Vulnerability:** Simple modulo operation on CSPRNG output (e.g., `crypto.getRandomValues(array)[0] % 6`) introduces modulo bias, making certain outcomes more likely when the range doesn't evenly divide the byte size (256).
**Learning:** Security in games isn't just about preventing hacks, but ensuring mathematical fairness. Cryptographically secure random numbers must be processed correctly to maintain their uniformity.
**Prevention:** Always use rejection sampling when mapping CSPRNG output to a range that does not evenly divide the bit-space of the source (e.g., discard values >= 252 when seeking a 1-6 range from a single byte).

## 2025-05-15 - Nginx Header Inheritance Pitfall
**Vulnerability:** Security headers defined at the `server` level in Nginx are silently dropped for any `location` block that defines its own headers (e.g., for `Cache-Control`).
**Learning:** Nginx `add_header` directives do not inherit from parent blocks if the current block contains its own `add_header` directives.
**Prevention:** Re-declare or use include files for standard security headers in every `location` block that modifies response headers to ensure "Defense in Depth" is maintained across all assets.
