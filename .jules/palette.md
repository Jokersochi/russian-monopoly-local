## 2024-05-24 - Semantic Buttons for Expandable Panels
**Learning:** Using non-interactive divs for expandable accordion elements prevents screen reader state announcements and breaks keyboard focus navigation.
**Action:** Always use semantic <button type="button"> elements with aria-expanded, aria-controls, and w-full text-left styling when building custom expandable card sections to preserve layout while enabling full accessibility.
