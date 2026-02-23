# @blue-learn/platform

Platform layer of the Bluelearn design system. Provides the renderer and navigation
primitives that let React Native screens be described as data (schema) rather than
hardcoded JSX — the mechanism behind the app's server-driven UI surfaces.

Consumed by `bluelearn-app` alongside `@blue-learn/component`,
`@blue-learn/schema`, and `@blue-learn/theme`.

## Install

Published over git rather than to a registry. Add to a consumer's
`package.json`:

```json
"@blue-learn/platform": "git+ssh://git@github.com:Blue-learn/design-platform.git"
```

Requires SSH access to the Blue-learn org.

For local development:

```bash
yarn install
```

## Setup

No environment configuration — this is a library with no runtime config.

## Getting started

```bash
yarn dev          # build in watch mode
```

To develop against a consumer app, build and copy into its `node_modules`:

```bash
yarn copy             # one-shot copy into the consuming app
yarn copy-watcher     # rebuild + copy on change
yarn copy-win         # Windows equivalent
```

## Run

| Command | What it does |
|---|---|
| `yarn build` | Compile the package |
| `yarn dev` | Build in watch mode |
| `yarn copy` / `copy-watcher` / `copy-win` | Sync the build into a consumer |
| `yarn lint` | ESLint |
| `yarn format` | Prettier check |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn version-bump` | Bump the package version |
| `yarn publish` | Publish a new version |

## Test

No test suite. `yarn typecheck` and `yarn lint` are the gates, and both run in CI
with a dependency audit and a secret scan.

## Environment

None — no environment variables are read.

## Architecture

```
src/
  components/   Platform-level components
  context/      Providers shared across rendered screens
  hook/         Hooks used by the renderer
  navigation/   Navigation primitives
  renderer/     Turns a screen schema into a React Native tree
  utility/      Helpers
scripts/        Build and copy tooling
```

`renderer/` is the core: it walks a schema (typed by `@blue-learn/schema`),
resolves each node to a component from `@blue-learn/component`, and applies tokens
from `@blue-learn/theme`.

Built against **React 17 / React Native 0.67** to match the consuming app.

## Usage

```ts
import { Renderer } from '@blue-learn/platform';
```

Give the renderer a screen schema and it produces the corresponding native tree.
Adding a new renderable node means adding the component in `design-component` and
its schema entry there first.

## API

Exports the renderer, navigation primitives, context providers, and hooks from
`src/index`. There is no network layer in this package.

## Contributing

Run `yarn lint && yarn typecheck` before opening a PR. Bump the version with
`yarn version-bump` — consumers pin by git ref, so an unbumped change will not
propagate.
