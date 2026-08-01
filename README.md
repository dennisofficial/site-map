# @dltech/site-map

A typed, composable site-map builder. Declare your app's routes as a tree and get back an object
of route functions — each one autocompleted, each one accepting only the query params you
declared for it.

## Install

```bash
pnpm add @dltech/site-map
```

## Usage

Build the tree with `createSiteMap`. `makeRoute` adds a static segment (optionally nesting more
routes inside it via a callback); `param` adds a dynamic segment, applied functionally.

```ts
import { createSiteMap } from '@dltech/site-map';

export const SITE_MAP = createSiteMap(({ makeRoute }) => ({
  auth: makeRoute('auth', ({ makeRoute }) => ({
    login: makeRoute<{ next?: string }>('login'),
    signup: makeRoute('signup'),
  })),
  jobs: makeRoute('jobs', ({ param }) => ({
    job: param(({ param }) => ({
      thread: param(() => ({})),
    })),
  })),
}));
```

Every leaf is a callable that returns the path, and takes an optional object of query params that
get serialized onto the URL:

```ts
SITE_MAP.auth.login(); // '/auth/login'
SITE_MAP.auth.login({ next: '/app' }); // '/auth/login?next=%2Fapp'
```

Param leaves (declared with `param`) take the id first, then are called again to yield the
string — this is what lets a param segment nest further static and dynamic routes beneath it:

```ts
SITE_MAP.jobs.job(jobId)(); // '/jobs/:jobId'
SITE_MAP.jobs.job(jobId).thread(threadId)(); // '/jobs/:jobId/:threadId'
```

Query param types are per-route — pass a type argument to `makeRoute<TQuery>` to constrain what
callers can pass for that leaf; leaves without one default to `Record<string, QueryValue>`.
