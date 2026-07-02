# Product

## Register

product

## Users

Two audiences at the same surface:

- **Homeowners** planning a renovation who need a staircase and have likely *never*
  sized one. Context: at a desk or on a couch, exploring what's possible, unsure of
  the vocabulary, wary of getting something wrong or expensive.
- **Contractors / builders** speccing a straight-run stair for a job. Context: fast,
  practical, code-literate; they want correct numbers and a parts list they can act
  on without hand-holding.

Both start from a few facts about their space, get a live code-compliant 3D
staircase they can reshape, and finish by requesting a quote from a stair-parts
seller. In the mature product the tool is embedded on a stair company's own website;
in v1 it runs single-tenant and anonymous.

## Product Purpose

A white-label, embeddable **3D stair configurator** that stair-parts Companies
license for their own sites. A visitor enters a handful of space measurements, sees a
live, code-compliant straight-run staircase in interactive 3D, reshapes it through
side-panel controls, and finishes by sending a price-free **Request for Quote** (a
Purchase Order in the priced end state) to the seller.

v1 is a **single-tenant, anonymous test harness** that must prove two things:
**technical feasibility** (we can generate a genuinely code-compliant stair in
interactive 3D from a few inputs, and it feels good) and **user desirability** (real
homeowners and contractors enjoy configuring this way and would use it). Success is
measured by completion and enthusiasm, not revenue — commercial pull is a parallel
sales motion using v1 as the demo.

## Brand Personality

**Precise, trustworthy, calm.** The tool feels like it *knows the building code* —
exact numbers, clean instrument-like clarity, confident guidance. Its authority is
quiet, never cold or bureaucratic. It speaks plainly enough that a first-time
homeowner is never lost, and accurately enough that a contractor never doubts it.

Emotional goal: the user believes the staircase on screen is **real and buildable**,
and feels **capable** designing it — the satisfaction of shaping something physical,
not the anxiety of a form that might be wrong.

## Anti-references

- **Generic SaaS dashboard** — card-grid clutter, gradient accents, hero-metric
  templates, the default AI-startup look. Nothing here should read as "analytics app";
  it should read as "staircase."
- **Cheap big-box configurator** — clunky, spammy home-improvement store tools: busy,
  low-trust, upsell-heavy, sluggish. The opposite of the credibility we're selling.
- **Intimidating CAD software** — sterile, dense, engineer-only. Toolbars everywhere,
  gray-on-gray, hostile to a homeowner. Expert depth without the hostility.
- **Toy / gimmicky 3D** — cartoonish, bouncy, game-like 3D that undercuts credibility.
  This is a serious purchasing tool, not a plaything.

## Design Principles

1. **Credibility is the product.** The entire value is that the stair is code-compliant
   and buildable. Every number, warning, and rendered part must earn trust — the moment
   the tool feels approximate or wrong, it has failed, no matter how pretty.

2. **Two numbers to a stair.** The desirability bet is minimal friction to the payoff:
   the 3D moment arrives fast (Total Rise + Ceiling Height is enough), and everything
   else is an optional refinement. Never gate the reward behind a long form.

3. **Advisory, never blocking — but never silent.** Warnings guide; they don't wall.
   The user is always in control and can push a design out of code or out of the space,
   but such overrides are deliberate and visible, never silent and never forced.

4. **Show the real thing.** What's on screen is what gets ordered. Dimensions are the
   quantized numbers a shop actually cuts; warnings travel with the order; the 3D is an
   honest preview, not a flattering illustration. No fudging between the view and the PO.

5. **Approachable to a homeowner, credible to a pro.** Serve both at once: plain-language
   guidance and gentle defaults for the novice, exact numbers and no dumbing-down for the
   expert. Depth that reveals itself rather than confronting everyone up front.

## Accessibility & Inclusion

- **Target: WCAG 2.2 AA.** Verified contrast (body ≥ 4.5:1, large text ≥ 3:1),
  full keyboard navigation, visible focus states, correctly labeled controls, and
  form/error semantics.
- **Strong reduced-motion.** The live 3D preview and every transition must have solid
  `prefers-reduced-motion` fallbacks — the interface stays fully usable and legible
  with motion suppressed; nothing critical is conveyed by animation alone.
- Controls (sliders, steppers, dropdowns) meet target-size and label requirements;
  the derived-dimension readouts and advisory warnings are conveyed textually, not by
  color alone.
