# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Added a coverage gate (52%/48%/55%/51%) matching the suite's measured
  coverage across all of `src/`. Coverage tooling was configured but ungated,
  which matters more here than elsewhere: this ships as a versioned package.

## [0.0.16] - 2026-07-17

### Added

- CI workflow (lint / type-check / test / build) with a dependency audit, a
  secret scan and a deploy stage.
- Test coverage for the renderer, the shared context and the hooks, on top of
  the first `SharedPropsService` suite.
- An error boundary that isolates widget render failures so one bad widget
  cannot take down the host surface.
- README documenting setup, architecture, environment and usage, and a
  `CONTRIBUTING.md`.

### Changed

- `tsc` now runs on `prepare`, so consumers install the declared types.

### Fixed

- Made lint work, and fixed the eight real bugs it found.

### Removed

- Committed secrets purged from the working tree.
