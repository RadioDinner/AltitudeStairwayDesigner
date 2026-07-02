# Advisory Fit warnings in v1, with a reserved seam for hard length limits

Advisories come in two kinds, both never-blocking ([ADR 0003](0003-irc-enforcement-with-advisory-overrides.md)):

- **Code warning** — an IRC dimensional rule is violated ([ADR 0015](0015-v1-irc-dimensional-ruleset.md)).
- **Fit warning** — the derived stair doesn't fit the physical space the user
  described (e.g. total run > available run length).

In v1, exceeding the available run length raises a **Fit warning** only. The Run
control is **not clamped** — clamping would silently hide the conflict, and the
user's stated space may be approximate or flexible. There is no free fix: making a
too-long stair fit forces either a sub-10″ Run or a taller-than-7¾″ Rise, each its
own Code warning.

Why advisory-only for now: real **technical hard lengths** exist (manufacturing /
stock maximums, physical space limits) and will eventually clamp the model, but
that enforcement is deferred.

## Reserved seam ("make space for it")

The dimension model reserves an **unenforced hard-limit field** on dimension
bindings (physical min/max) — present from v1, read by nothing yet, the seam a
future clamp/enforcement pass consumes. Same pattern as
[Match Key](0013-defer-compatibility-engine-curate-compatible-catalog.md): record
the constraint now, enforce later, no rework.
