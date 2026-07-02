# CLAUDE.md

Guidance for agents working in this repo.

## Design Context

This is the **Altitude Stairway Designer** — a white-label, embeddable **3D stair
configurator** (product register). Before doing any design or frontend work, read the
canonical docs; don't re-derive their decisions:

- **[PRODUCT.md](PRODUCT.md)** — strategic intent: users (homeowners + contractors),
  purpose (code-compliant 3D stair → RFQ), brand personality (**precise, trustworthy,
  calm**), anti-references, the five design principles, and accessibility (**WCAG 2.2
  AA + strong reduced-motion**).
- **[DESIGN.md](DESIGN.md)** — visual system. North Star **"The Joiner's Bench"**:
  calm instrument-like chrome, warmth carried by the timber in the 3D model, not the
  UI. Restrained palette + one warm timber accent, sans + tabular-mono for numbers,
  flat-by-default, responsive motion. **Currently a SEED** — re-run `/impeccable
  document` once there's code to extract real tokens.
- **[CONTEXT.md](CONTEXT.md)** — the domain's ubiquitous language (Stairway Package,
  Configurator, Intake, Rise/Run, Guard, RFQ, etc.). Use these terms exactly.
- **[docs/PLAN.md](docs/PLAN.md)** + **[docs/adr/](docs/adr)** — the v1 plan and 30+
  ADRs recording every settled decision (units, seeding, advisory warnings, RFQ flow,
  post-to-post rail system, and more). Check the ADRs before reopening a decision.

Design work in this repo runs through the **impeccable** skill (`/impeccable <cmd>`).
The smallest honest first surface to build is **Intake** — the two-number front door
(Total Rise + Ceiling Height) to the first 3D render.
