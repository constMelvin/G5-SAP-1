# Approved CSS 3D board implementation plan

Goal: Apply the approved portrait and road mockup without changing CPU behavior.
Approach: CSS perspective rather than WebGL; retain accessible HTML readouts.
1. Extract approved SVG portraits into a React component.
2. Add decorative roads using the existing source and target coordinates.
3. Add final scoped styles overriding compact layout flattening, preserving readable values and responsive scrolling.
4. Run build and existing tests. No CPU changes or new dependencies.

