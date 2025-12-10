# Floating Planets

## Overview
Interactive floating planets on the homepage that serve as navigation elements. Users can click on planets to navigate to different sections of the site.

## Implementation Details

### Location
- **Component**: `src/components/floating-planets.tsx`
- **Used in**: `src/app/page.tsx` (homepage only)

### Features
- Two animated planets orbiting around the center of the viewport
- Smooth orbital motion with different speeds and directions
- Visible orbit paths with subtle dashed lines
- Hover effects with scale animation (15% larger on hover)
- Click to navigate:
  - Blue planet → `/blog`
  - Green planet → `/packages`
- Canvas-based rendering for smooth 60fps animations
- Responsive to window resize
- Glow effects and gradients for visual appeal

### Technical Details

#### Animation
- Uses `requestAnimationFrame` for smooth 60fps animations
- Planets orbit around the center of the viewport
- Each planet has its own orbital radius and speed
- Planets rotate in opposite directions for visual interest
- Smooth scale transitions using lerp (linear interpolation)
- Orbital paths are drawn with subtle dashed lines

#### Visual Effects
- Radial gradients for 3D sphere appearance
- Outer glow effect for depth
- Inner stroke for definition
- Shadow on text labels
- Color-coded planets:
  - Blog: Blue (#3b82f6)
  - Packages: Green (#10b981)

#### Interaction
- Hover detection with cursor change
- Scale animation on hover (1.0 → 1.15)
- Click detection for navigation
- Smooth transitions using easing

### Performance
- Canvas rendering for optimal performance
- Single animation loop for both planets
- Cleanup on component unmount
- Responsive to window resize events

## Customization

### Adjusting Planet Properties
Edit the planet initialization in `floating-planets.tsx`:

```typescript
{
  angle: 0,                      // Starting angle in radians (0 = right, π = left)
  orbitRadius: 250,              // Distance from center of viewport
  orbitSpeed: 0.008,             // Rotation speed (radians per frame, negative = counterclockwise)
  planetRadius: 100,             // Planet size
  color: '#3b82f6',             // Planet color
  link: '/blog',                // Navigation target
  label: 'Blog',                // Display label
}
```

**Tips:**
- Use `Math.PI` for opposite starting positions
- Negative `orbitSpeed` makes planets rotate counterclockwise
- Larger `orbitRadius` creates wider orbits
- Different speeds create interesting orbital patterns

### Adding More Planets
To add additional planets, simply add more objects to the `planetsRef.current` array with the same structure.

### Changing Colors
Update the `color` property in the planet configuration. The component automatically generates gradients and glows based on this color.

## Browser Compatibility
- Uses HTML5 Canvas API (supported in all modern browsers)
- Requires JavaScript enabled
- Gracefully degrades if canvas is not supported

## Future Enhancements
Potential improvements:
- Add particle trails behind planets as they orbit
- Implement elliptical orbits instead of circular
- Add rotation animation to planets (spinning on their axis)
- Include icons inside planets
- Add sound effects on click
- Implement touch gestures for mobile
- Add keyboard navigation support
- Create multiple orbital layers with different speeds
- Add comet or asteroid effects
- Implement planet collision detection
