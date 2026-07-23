# UI Refactor Handoff

## Ticket 01 — resolved

### Changed

- `app/globals.css`: applied ice-canvas design tokens, inverse tokens, control/media radii, system sans-serif body stack, and visible `:focus-visible` outline.
- `app/[locale]/(public)/layout.tsx`: replaced wrapping public navigation with responsive navigation component.
- `app/[locale]/(public)/_components/public-navigation.tsx`: added keyboard-operable `<=991px` menu button with visible `菜单` label, `aria-expanded`, and `aria-controls`; all existing links and destinations preserved.
- `e2e/public-experience.spec.ts`: added mobile keyboard navigation regression.

### Verification

- `pnpm verify`: passed (`eslint .`, `tsc --noEmit`).
- `pnpm test:e2e --grep '公开导航|小屏公开导航|目标宽度'`: 3 passed.
- `git diff --check`: passed.
- Main-agent independent acceptance: `pnpm verify`, `git diff --check`, and `pnpm exec playwright test e2e/public-experience.spec.ts --grep '公开导航|小屏公开导航|目标宽度' --reporter=line` passed (3/3).

### Known regression baseline

- The full `e2e/public-experience.spec.ts` suite still fails its pre-existing assertion for `LAWSON 的原创 3D 人物形象` on the homepage. Ticket 01 does not modify the homepage Hero. Recheck after Ticket 02 removes the legacy Hero motion and update its test expectation as part of that ticket; do not claim full public-experience regression is green before then.

### Risks / Design Spec Gaps

- `DESIGN.md` currently describes confirmed local fonts, while this ticket/spec requires system-font fallback. No local font was loaded; body remains system sans-serif and UI uses Tailwind system monospace fallback. Resolve the source-of-truth wording separately; do not overwrite user `DESIGN.md` edits.
- `CONTEXT.md` still describes River Hero and ripple motion. Current UI ticket follows the new light foundation; Ticket 02 owns removal of homepage motion. Record final documentation conflict again in Ticket 06.

### Integration request

- None. `app/globals.css` is the approved Ticket 01 shared foundation. Subsequent tickets should consume existing tokens; if token semantics must change, request main-agent integration rather than silently rewriting them.

## Ticket 02 — resolved

- Main-agent integration and acceptance passed: `e2e/public-experience.spec.ts` (4/4), `pnpm verify`, and `git diff --check`.
- Replaced rendered River Hero with static light editorial Hero; preserved existing content queries, routes, SEO, public footer links, and About content.
- Detail: `river-hero.tsx` remains unreferenced. Its removal is deferred to Ticket 06 cleanup after all consumers are checked.

## Ticket 03 — resolved

- Main-agent integrated catalogue/search pages without changing query, filter, cursor, link, or cover semantics.
- `pnpm verify` and the integrated `projects`, `curated`, and `search` Playwright suite completed successfully; `git diff --check` passed.

## Ticket 04 — resolved

- Main-agent integrated unified public detail layouts while retaining Markdown, code copy, managed media, project facts, and real external links.
- Detail routes are included in the integrated `projects` and `curated` browser regression run; final sitewide regression remains Ticket 06 scope.

## Ticket 05 — integrated, awaiting non-author acceptance

- Main-agent integrated login and author workspace UI. Static verification and production build completed; lifecycle controls now update their displayed state after successful publish/unpublish, avoiding stale route-refresh UI.
- Real author lifecycle regression was rerun after the fix with no new failure artifact.
- Blocking evidence gap: `evidence/auth/non-author.json` is absent, so `e2e/non-author.spec.ts` skips both authenticated non-author denial checks. Do not mark Ticket 05 resolved or start Ticket 06 until a real non-author GitHub session is supplied and this spec passes.

## Independent visual verification

- Independent read-only verifier passed public home, About, catalogues, search, three public detail types, and login at desktop/mobile with no horizontal overflow; mobile navigation and visible keyboard focus passed.
- Authenticated author workspace passed desktop/mobile page-level overflow inspection. Local screenshot evidence remains under gitignored `evidence/ui-verification/`.
- The only remaining verification gap is authenticated non-author denial: `evidence/auth/non-author.json` is absent.

## Ticket 05 — resolved

- Real non-author session supplied after initial verification. `pnpm exec playwright test e2e/non-author.spec.ts --reporter=line` passed (2/2): workspace denial and protected write denial both verified.

## Ticket 06 — resolved

### Current state

- Tickets 01–06 are marked `resolved` after main-agent final acceptance.
- `evidence/auth/non-author.json` is present locally and ignored by `.gitignore`; `evidence/ui-verification/` is likewise ignored. Neither is staged.
- Unused `river-hero.tsx` was removed after confirming it had no consumer; this removes the obsolete animation implementation created as an orphan by Ticket 02.

### Verification

- `pnpm verify`: passed.
- `pnpm build`: passed after temporarily stopping the local dev server (Next 16 rejects a concurrent dev lock as another build); the dev server was restarted and is listening on port 3000.
- `git diff --check`: passed.
- Full `pnpm test:e2e` completed after real author and non-author sessions were available. A seed-dependent public assertion was repaired to assert a real curated item rather than a mutable `LangChain` title; targeted public suite passed 4/4. No new final-run failure artifact remained.
- Final main-agent checks: `pnpm verify`, `pnpm build`, `git diff --check`, public/author/non-author e2e, and independent desktop/mobile visual inspection passed. Dev server restored on port 3000.

### Design Spec Gaps

- UI uses the requested system-font fallback. `DESIGN.md` still describes confirmed local fonts; do not overwrite user edits. Reconcile source-of-truth wording outside this ticket.
- Current UI follows the shallow, light, no-motion `DESIGN.md` direction. `CONTEXT.md` still describes the dark River Hero/ripple treatment. Preserve this documented conflict; do not rewrite domain documents in this UI ticket.

## Post-acceptance Hero direction update

- User explicitly restored the homepage Hero, character layer, and ripple interactions. The prior no-motion requirement no longer applies to this Hero.
- New image-generation asset: `public/images/hero-river-light-v1.png`. It replaces only the Hero background with a shallow ice-blue river valley; no existing image was overwritten.
- `RiverHero` again renders the existing character, desktop pointer ripples, mobile low-frequency ripples, and `prefers-reduced-motion` static behavior.
- Verified after restoration: `pnpm verify`, `e2e/public-experience.spec.ts` (5/5), and `git diff --check`.
