# v1 IRC dimensional ruleset (residential, IRC R311.7)

The generation engine checks a fixed set of residential IRC dimensional rules,
each surfaced as an [Advisory Override](0003-irc-enforcement-with-advisory-overrides.md)
(flagged, never hard-blocked):

1. **Max Rise** — 7¾″
2. **Min Run** — 10″
3. **Rise uniformity** — largest − smallest riser ≤ ⅜″ across the flight
4. **Run uniformity** — largest − smallest run ≤ ⅜″ across the flight
5. **Min headroom** — 6′8″, measured at the stairwell opening's near edge (see below)
6. **Min width** — 36″ above the handrail
7. **Handrail height** — 34″–38″ above the nosing line
8. **Baluster spacing** — 4″-sphere rule

Handrail *graspability* (grip cross-section limits) is **out** — it is a property
of the catalog rail Style's profile, not of generated geometry.

Why: getting rise/run/headroom/spacing right is the credibility of the whole tool,
so the set must be explicit and testable rather than "IRC, roughly." Uniformity
(#3/#4) matters once manual Rise nudging is allowed. Graspability is excluded
because the engine never generates the rail's cross-section.

## Headroom requires two Intake inputs

Headroom cannot be computed from Total Rise alone — the binding point is the
stairwell opening's near edge (the header where the flight passes through the floor
above), not the ceiling over the bottom of the stair:

```
headroom = ceiling_height − Total Rise + (slope × opening_length)
```

A longer opening pushes the header further up the flight, yielding *more* headroom.
So [Intake](../../CONTEXT.md) collects **Ceiling Height** (required) and
**Stairwell Opening Length** (optional, defaulting to the stair's full projected
run length — the "open above the whole flight" case, the most forgiving). Without
the opening length a headroom flag would be guesswork; defaulting it keeps Intake
light while keeping the check honest.
