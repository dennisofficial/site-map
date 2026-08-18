---
'@dltech/site-map': patch
---

Fix the doubled slash in paths built from a root-level `param()`.

A `param()` used as the first segment of the tree joined against a base path of `/`, and
unlike `makeRoute` it never normalized the result — so `SITE_MAP.org('org_123')()` returned
`//org_123` instead of `/org_123`. Both now go through one shared join helper, so they cannot
drift apart again. Params nested deeper were never affected.
