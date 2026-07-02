<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Altitude Stairway Designer
description: A precise, trustworthy 3D stair configurator — calm instrument chrome, warmth carried by the timber in the model, not the UI.
---

# Design System: Altitude Stairway Designer

## 1. Overview

**Creative North Star: "The Joiner's Bench"**

A joiner is the skilled woodworker who actually builds a staircase, and the bench is
where exact, trustworthy work happens: a clean, well-lit surface; tools laid out with
intent; the warmth of real timber against calm, neutral wood and steel. That is the
whole system. The **chrome is the bench** — quiet, precise, instrument-like, getting
out of the way — and the **stair is the timber** — the one place warmth and color
live. The interface earns trust the way a good tool does: by being exact, legible, and
never showing off.

This is a **product** surface, not a brand one. It should feel like a serious tool a
contractor and a first-time homeowner can both trust in the same session — fluent and
familiar in the way Linear is fluent, where the interface disappears into the task. It
is **Restrained by default**: a clean, near-white working surface, one warm timber
accent used sparingly, and every dimension rendered like a reading on an instrument.
The live 3D staircase is the hero; the panels exist to serve it.

It **explicitly rejects** four things, carried verbatim from PRODUCT.md's
anti-references: the **generic SaaS dashboard** (card-grid clutter, gradient accents,
hero-metric templates), the **cheap big-box configurator** (busy, spammy, low-trust,
upsell-heavy — including its literal saturated-orange palette), **intimidating CAD
software** (sterile gray-on-gray, toolbars everywhere, hostile to a homeowner), and
**toy / gimmicky 3D** (cartoonish, bouncy, game-like).

**Key Characteristics:**
- Calm, near-white working surface; warmth comes from the model, not the chrome
- One warm **timber** accent (~39° hue), used ≤10% — actions, selection, focus
- Numbers everywhere, set like instrument readings (tabular figures)
- Precise, legible, familiar; delight is reserved for moments, not pages
- Responsive motion that confirms state — never choreography

## 2. Colors

Restrained: a clean neutral surface, one warm timber accent, and a disciplined
semantic set for advisory states. The saturated color budget belongs to the rendered
staircase, not the interface.

### Primary
- **Timber Accent** (warm amber / burnt-orange family, ~39° hue) *[exact OKLCH to be
  resolved during implementation]*: primary actions, current selection, focus rings,
  active controls. Evokes wood and craft without becoming the big-box orange — kept
  rare (≤10% of any screen) and never used as a fill behind large areas.

### Neutral
- **Bench Surface** (clean near-white; pure white or a whisper of warmth at very low
  chroma) *[to be resolved during implementation]*: the primary working background for
  panels and content.
- **Viewport Ground** (a calm, slightly deeper cool-neutral) *[to be resolved]*: the
  canvas *behind* the 3D staircase, pulled a touch darker/cooler than the panels so the
  timber model reads with depth and pops forward.
- **Ink** (near-black, ≥7:1 on the surface) *[to be resolved]*: body text and figures.
- **Muted Ink** (secondary text, ≥4.5:1) *[to be resolved]*: labels, helper text,
  units — never a pale gray that fails contrast for "elegance."

### Semantic (advisory states — a first-class part of this product)
- **Code Warning** and **Fit Warning** need distinct, legible treatments (an IRC rule
  violated vs. the stair not fitting the space). Advisories are guidance, never blocks
  — so they must read as *attention*, not *alarm*, and must be conveyed by icon + text,
  **not color alone**. *[exact hues to be resolved during implementation.]*

### Named Rules
**The Timber-Is-The-Only-Color Rule.** Saturated color lives in the 3D staircase and
in the single timber accent — nowhere else. If a panel, header, or card is reaching for
color to look "designed," it is wrong. The bench is neutral so the wood can speak.

**The No-Big-Box-Orange Rule.** The warm accent is a *restrained* timber tone used
sparingly. A saturated orange carrying large fills or backgrounds reads as a
home-improvement-store configurator — the exact anti-reference. Keep it rare and let it
mean "act / selected / focused," never "decoration."

## 3. Typography

**Display / UI Font:** A humanist or technical **sans** *[family to be chosen at
implementation]* — used for headings, labels, controls, and prose.
**Numeric / Data Font:** A **tabular monospace** *[family to be chosen at
implementation]* — used for every dimension readout: Total Rise, Rise, Run, Riser
Count, headroom, and the PO cut list.

**Character:** One calm, precise sans carries the interface; a mono face carries the
numbers. The pairing is a genuine contrast axis (proportional humanist vs. mono), not
two similar sans, so figures read like an instrument panel while prose stays warm and
human. No serif display — this is a task tool, not a magazine.

### Hierarchy
- **Display** *(fixed rem, not fluid; product UI views at consistent DPI)*: screen and
  step titles (Intake, Configurator). Used sparingly.
- **Title:** panel and section headers in the side panel.
- **Body:** helper text, guidance, warning copy. Prose capped 65–75ch.
- **Label:** control labels and units. Quiet, legible, never pale-gray.
- **Numeric:** the mono readouts — the signature type role. Tabular figures so digits
  align column-to-column as the user steps Riser Count or drags Run.

### Named Rules
**The Instrument-Readout Rule.** Every dimension is set in tabular mono with its unit,
formatted the way it is *displayed* (feet-inches-fractions), while the model carries
the exact float underneath (per the units decision in the project ADRs). Numbers align,
never jump width, and read as measurements — not body copy.

**The One-Family-For-Words Rule.** All non-numeric text is one sans in multiple
weights. No second display face, no serif for "gravity." Contrast comes from weight and
size, and from the sans/mono split.

## 4. Elevation

Flat by default. Motion is **Responsive**, not choreographed, and depth follows the
same restraint: surfaces are flat at rest, and elevation appears only as a **response
to state** — a panel that floats over the viewport, a dropdown/popover, a focused
control, the acknowledgment gate before submit. No decorative drop shadows on static
cards; no glassmorphism. Depth in the *3D viewport* is real (the rendered stair), so the
2D chrome around it stays deliberately calm and layered by tone, not by heavy shadow.

### Named Rules
**The Flat-Bench Rule.** The working surface is flat. A shadow is an event — hover,
focus, an overlay lifting above the 3D canvas — never a default decoration. If a card
has a resting shadow for looks, remove it.

## 6. Do's and Don'ts

### Do:
- **Do** keep the interface **Restrained** — clean neutral surface, one warm timber
  accent ≤10% of any screen, saturated color reserved for the 3D staircase.
- **Do** set every dimension in **tabular mono** with its unit, aligned like an
  instrument readout, formatted feet-inches-fractions for display.
- **Do** make advisory warnings read as **attention, not alarm** — icon + text, never
  color alone — because they guide and never block.
- **Do** put the 3D staircase on a **calmer, slightly deeper viewport ground** so the
  timber model reads with depth and stays the hero.
- **Do** use **Responsive motion** (150–250ms, ease-out), confirming state changes and
  live dimension updates, with a full `prefers-reduced-motion` fallback on every
  transition and on 3D camera moves.
- **Do** keep one sans for all words; contrast through weight and size.

### Don't:
- **Don't** build a **generic SaaS dashboard** — no card-grid clutter, no gradient
  accents, no hero-metric templates, no gradient text.
- **Don't** look like a **cheap big-box configurator** — no busy, spammy, upsell-heavy
  chrome, and specifically **no saturated big-box orange** carrying large fills or
  backgrounds.
- **Don't** become **intimidating CAD software** — no gray-on-gray density, no
  wall-of-toolbars, nothing hostile to a first-time homeowner.
- **Don't** ship **toy / gimmicky 3D** — no cartoonish, bouncy, elastic, or game-like
  motion; this is a serious purchasing tool.
- **Don't** use **glassmorphism**, decorative resting shadows, or `border-left`/
  `border-right` colored side-stripes on panels, callouts, or warnings.
- **Don't** let muted text fall below 4.5:1 for "elegance" — figures and labels must be
  legible on a job site in variable light.
