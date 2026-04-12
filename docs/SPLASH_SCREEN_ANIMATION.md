# MATCH App - Lightning Strike Splash Animation

## Motion Specification (Updated)

The MATCH splash screen uses a cinematic 3-second sequence to establish a "Sport-Tech" high-energy identity.

### 1. Visual Identity
- **Logo:** Neon Green (#9CFF00) lightning "M".
- **Background:** Radial gradient from Brand Violet (#6D00FF) in the center to Deep Blue-Black (#000025) at the edges.
- **Typography:** Bold, narrow geometric sans-serif (Gotham Narrow style) in Pure White (#FFFFFF) with a violet glow.

### 2. The Reveal Sequence (Total Duration: ~3.0s)

1.  **Intro (0.0s – 0.5s):**
    *   Background gradient is dim.
    *   A soft violet glow pulses in the center to build tension.

2.  **Lightning Strike (0.5s – 1.1s):**
    *   A jagged neon-green bolt shoots down from above the screen.
    *   A radial burst of green/violet energy expands from the strike point.

3.  **Logo Morph (1.1s – 1.8s):**
    *   The strike point evolves into the stroke-draw outline of the "M" logo.
    *   The outline is quickly replaced by a solid neon-green fill.
    *   Logo scales slightly up into its final position.

4.  **Wordmark Reveal (1.8s – 3.0s):**
    *   The "MATCH" wordmark slides up and fades in below the logo.
    *   A thin neon-green progress line grows from the center outward and shrinks back in a loop.

5.  **Idle State (3.0s+):**
    *   The entire wordmark performs a subtle 2.5s "breathing" loop (100% to 103% scale).

## Technical Implementation
- **Component:** `src/screens/SplashScreen.tsx`
- **Engine:** React Native `Animated` API with `react-native-svg`.
- **Timing:** App loading state is hardcoded to 5000ms in `AppNavigator.tsx` to accommodate the full animation.
- **Assets:** Fully vector-based (SVG) for maximum sharpness on all display densities.
