# @dltech/site-map

## 1.0.1

### Patch Changes

- f0bb3de: Fix the doubled slash in paths built from a root-level `param()`.

  A `param()` used as the first segment of the tree joined against a base path of `/`, and
  unlike `makeRoute` it never normalized the result — so `SITE_MAP.org('org_123')()` returned
  `//org_123` instead of `/org_123`. Both now go through one shared join helper, so they cannot
  drift apart again. Params nested deeper were never affected.

## 1.0.0

### Major Changes

- First public release.

  Previously consumed as `@workspace/site-map` through a git submodule. The package now
  ships compiled type declarations from `dist` rather than pointing consumers at its
  TypeScript sources, and releases through CI with npm provenance.
