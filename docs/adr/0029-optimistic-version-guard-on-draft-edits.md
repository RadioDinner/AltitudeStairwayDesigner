# An optimistic version guard prevents silent clobber of a shared draft

The draft Share Link ([ADR 0020](0020-draft-autosave-share-link-from-start.md)) is
intended as **single-user resume** — close the tab, reopen your work. But the link is
the only access control ([ADR 0006](0006-multi-tenant-white-label-end-state-single-tenant-v1.md)),
so a user can forward it (buyer → contractor) and end up with two browsers
autosaving the same Design.

## Guard, don't collaborate

The `design` row carries a **`version`** (or `updated_at`) column. Each autosave
sends the version it last read; the server applies the write only if that matches the
current row, and otherwise **rejects it with a reload prompt** ("this design was
changed in another window — reload to continue"). One column and a conditional update.

Why this and not the alternatives:

- **Last-write-wins (rejected)** would lose the other window's work **silently**.
  During a **desirability** test that is the worst failure mode: a user whose stair
  vanishes rage-quits, and the signal reads as "disliked the product" when it was
  "the tool ate my work."
- **Real collaborative editing / soft locks (rejected)** are more machinery than a
  single-tenant test harness needs. The link is for resume, not co-editing.

## Consequence

- Silent data loss becomes a **visible, recoverable** event.
- If testing shows people genuinely want to co-edit a shared link, revisit with
  presence / merge — the version column is the seam that makes that additive.
