# Design System Document

## 1. Overview & Creative North Star
### The Neon-Noir Ledger
This design system is built to redefine financial literacy for the next generation. We move away from the sterile, "corporate blue" world of traditional banking and into the **Neon-Noir Ledger**: a visual philosophy that blends futuristic cyber-aesthetics with sophisticated editorial clarity.

The "Creative North Star" is **Gamified Sophistication**. We reject the "dumbed down" visuals often targeted at younger audiences. Instead, we use high-contrast typography, deep tonal layering, and "Glassmorphism" to create a workspace that feels like a premium gaming HUD or a high-end trading terminal, yet remains intuitive and accessible.

The interface breaks the traditional "box-and-line" template by utilizing a modular Bento Grid layout. This allows for intentional asymmetry—large, data-rich hero modules sit alongside compact, punchy action cards—creating a rhythmic flow that guides the eye through the financial narrative.

---

## 2. Colors
Our palette is anchored by deep charcoals to ensure the vibrant accent colors feel like light sources within the interface.

- **Primary & Secondary:** `primary` (#a4ffb9) and `primary_container` (#00fd87) are our "Neon Growth" signals. They represent positive flow and primary actions. `secondary` (#c180ff) provides a "Purple Glow" contrast, used for secondary data points and soft ambient depth.
- **The "No-Line" Rule:** To achieve a premium, seamless feel, **1px solid borders are prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts. For instance, a `surface_container` card should sit on a `surface` background without an explicit stroke.
- **Surface Hierarchy & Nesting:** Use the surface-container tiers to create physical depth.
    - **Base:** `surface` (#0c0e0f)
    - **Sectioning:** `surface_container_low` (#111415)
    - **Floating Components:** `surface_container_highest` (#232628)
- **Signature Textures:** For high-impact areas like main CTAs or "Balance" cards, use a linear gradient transitioning from `primary_dim` (#00ed7e) to `primary_container` (#00fd87). This provides a sense of luminosity that flat hex codes cannot achieve.

---

## 3. Typography
The typography system uses a tri-font approach to balance personality with extreme legibility.

- **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, geometric structure. Large `display-lg` and `headline-lg` tokens should be used with tight letter-spacing to create an "Editorial Statement" for balances and titles.
- **Body & Titles (Manrope):** A high-performance sans-serif that ensures financial data is legible even at small sizes.
- **Labels (Space Grotesk):** This "Monospace-adjacent" font is used for `label-md` and `label-sm`. It injects a "hacker/dev" aesthetic into small metadata, reinforcing the futuristic theme.

---

## 4. Elevation & Depth
In this design system, depth is not a drop shadow; it is a **Tonal Stack**.

- **The Layering Principle:** Stacking determines importance. A nested element must always be at least one tier lighter or darker than its parent.
- **Glassmorphism:** To elevate floating elements (like modals or specific bento cells), use the `surface_variant` with a 40-60% opacity and a `backdrop-filter: blur(20px)`.
- **Ambient Glows:** Instead of standard shadows, use "Soft Purple Glows." Apply a `secondary` tinted shadow with a 32px to 64px blur at 8% opacity. This mimics the look of a neon sign reflecting off a dark surface.
- **The Ghost Border:** For accessibility in forms or interactive states, use a "Ghost Border": the `outline_variant` token at 15% opacity. It defines the edge without creating visual clutter.

---

## 5. Components

### Buttons
- **Primary:** High-gloss. Use the `primary_container` gradient with `on_primary_container` (dark text). High roundedness (`full`).
- **Secondary (Glass):** `surface_variant` at 20% opacity with a `backdrop-filter`. No fill. Use `on_surface` for text.
- **Tertiary:** Text-only with an icon. Use `primary` for the label color to indicate interactivity.

### Bento Cards
- **Structure:** Use the `xl` (1.5rem) roundedness scale. 
- **Style:** No borders. Use `surface_container` or `surface_container_high`.
- **Content:** Forbid divider lines. Use `spacing-6` (1.5rem) to separate internal content clusters.

### Input Fields
- **Default State:** `surface_container_lowest` background with a subtle `outline_variant` Ghost Border.
- **Active/Focus State:** The border transitions to a `primary` glow (1px).
- **Error State:** Use `error` (#ff716c) for both the label and a subtle inner-glow effect.

### Action Chips
- **Context:** Used for filtering or "Quick Tags" (e.g., #Savings, #Allowance).
- **Style:** Compact height, `md` (0.75rem) roundedness. Use `surface_bright` with `on_surface_variant` text.

### Progress Bars (The Growth Tracker)
- **Track:** `surface_container_highest`.
- **Indicator:** A vibrant gradient from `primary` to `secondary`. This visualizes the "flow" of money from green (income) to purple (growth).

---

## 6. Do's and Don'ts

### Do:
- **Do** use `display-lg` for the "Money Hero" (Balance). Make the currency symbol 50% smaller than the value to emphasize the number.
- **Do** use extreme vertical white space (from the `12` or `16` spacing tokens) to separate major content blocks.
- **Do** utilize the `secondary` purple glow sparingly behind cards to highlight "Featured" financial products or "Levels Reached."

### Don't:
- **Don't** use 100% black (#000000) for anything other than `surface_container_lowest` or true deep-shadow areas. It kills the "Neon-Noir" depth.
- **Don't** use standard dividers. If content feels cluttered, increase the spacing scale or shift the background tone of the sub-container.
- **Don't** mix more than two accent colors in a single module. If you use Neon Green for growth, keep the rest of the module monochromatic.