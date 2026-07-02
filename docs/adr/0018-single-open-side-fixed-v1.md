# Single open side with a full guard, fixed in v1

The v1 stair is always one open side (a full guard: handrail + balusters + shoe
rail + fillets + 2 newels + 2 caps) and one wall side (no parts). Sidedness is a
fixed assumption, not a user choice.

Why: this is the config that best demonstrates the product (v1's desirability goal)
and it exercises every part in the committed set ([ADR 0008](0008-v1-part-set.md)) —
notably the 2-newel / 2-cap counts the generation engine already derives. Making it
fixed avoids the guard/newel permutations of the other cases.

## Deferred

- **Walled both sides** — wall-mounted handrail only, no guard parts.
- **Open both sides** — two mirrored guards, 4 newels.

## Consequence / revisit trigger

A fixed one-open/one-wall stair may not match a given test user's actual space,
which could muddy desirability feedback. Revisit if testing shows sidedness is a
common mismatch.
