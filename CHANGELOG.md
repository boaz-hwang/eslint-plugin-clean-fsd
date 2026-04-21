# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-04-21

### Added
- **Two-axes framework** in docs: CQRS (read/write) × DDD (single-Aggregate / multi-Aggregate), with a 2×2 quadrant map that pins every piece of logic to a concrete folder.
- Recognition of new folder conventions in `parseFSDLocation`:
  - `selectors/` — single-Aggregate internal reads (also `selector/`)
  - `commands/` — single-Aggregate or multi-Aggregate writes (also `command/`)
  - `queries/` — multi-Aggregate reads (also `query/`)
- New `FSDLocation` fields: `isSelectorFile`, `isCommandFile`, `isQueryFile`.
- New rule **`no-upward-entity-import`** (error, included in `recommended`) — disallows `entities/*` from importing `features/*`, `widgets/*`, or `app/*`. Enforces single-direction dependency flow.
- README rewritten end-to-end with Two Axes explanation, Cart domain example across the full 2×2, folder convention table, and migration notes.
- Package keywords: `cqrs`, `ddd`, `aggregate`.
- Companion article link: https://www.productengineer.info/community/articles/ko/clean-fsd-two-axes

### Changed
- `entities-read-only-actions` now also checks `entities/*/selectors/` in addition to `action/` and `api/`. Error messages include which folder kind triggered the warning.
- `features-write-only-actions` now also checks `features/*/commands/` in addition to `action/` and `api/`. `features/*/queries/` is intentionally not checked (it's a read folder).
- Package description updated to reflect the two-axes framing.

### Unchanged
- All existing rules continue to work with identical semantics for `action/` and `api/` folders.
- `no-mutation-in-entities` still forbids Supabase mutations anywhere in `entities/`, including `selectors/` and `commands/`. Memory-state mutations inside `commands/` are permitted (this rule targets Supabase writes only, by method name).

### Migration from 0.1.x
- Fully backward compatible. Existing `action/` and `api/` conventions keep working.
- Opt-in: move pure single-Aggregate reads into `selectors/`, single-Aggregate writes into `commands/`, multi-Aggregate reads into `features/*/queries/`.
- The new `no-upward-entity-import` rule is **error** in `recommended`. If your codebase has `entities → features` imports, either move that coordination up into `features/*/commands/` or disable the rule temporarily.

## [0.1.1] - 2026-04-17

- GitHub metadata added for npm (repository, bugs, homepage).
- README rewritten in English.

## [0.1.0] - 2026-04-17

- Initial release.
- 8 rules covering CQRS-axis conventions for FSD + Next.js + Supabase projects.
