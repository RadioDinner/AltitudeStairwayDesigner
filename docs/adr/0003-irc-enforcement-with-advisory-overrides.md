# Enforce IRC by default, allow advisory overrides, single national ruleset for v1

The generator produces a code-compliant straight-run stair by default, using one
national U.S. residential ruleset (IRC — 7¾″ max rise, 10″ min run, plus headroom
and handrail-height checks). The user may nudge dimensions freely within the legal
band. Choices outside IRC are permitted but flagged with a visible advisory
warning; they are never silently accepted nor hard-blocked.

Why: guaranteeing a buildable, permittable stair is the core value, but hard-
blocking every out-of-code choice frustrates users with unusual spaces and edge
cases the code doesn't cleanly cover. Advisory overrides keep trust high while
leaving the user in control.

Why single national ruleset: jurisdiction-specific amendments are numerous and
maintenance-heavy. One national IRC baseline covers the common case; per-
jurisdiction rules can be layered on later without reworking the engine.
