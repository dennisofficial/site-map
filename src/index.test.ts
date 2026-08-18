import { describe, expect, it } from 'vitest';
import { createSiteMap } from './index';

const SITE_MAP = createSiteMap(({ makeRoute, param }) => ({
  org: param(({ makeRoute, param }) => ({
    settings: makeRoute('settings'),
    project: param(() => ({})),
  })),
  auth: makeRoute('auth', ({ makeRoute }) => ({
    login: makeRoute<{ next?: string }>('login'),
  })),
  admin: makeRoute('admin', ({ makeRoute }) => ({
    users: makeRoute('users', ({ makeRoute }) => ({
      roles: makeRoute('roles'),
    })),
  })),
}));

describe('static routes', () => {
  it('renders the root', () => {
    expect(SITE_MAP()).toBe('/');
  });

  it('renders a route and the routes nested inside it', () => {
    expect(SITE_MAP.auth()).toBe('/auth');
    expect(SITE_MAP.auth.login()).toBe('/auth/login');
  });

  it('renders a deeply nested route', () => {
    expect(SITE_MAP.admin.users.roles()).toBe('/admin/users/roles');
  });
});

describe('param routes', () => {
  // Regression: a param used as the first segment has a base path of '/', which produced
  // '//org_123' back when only makeRoute normalized the path it joined.
  it('does not double the slash for a root-level param', () => {
    expect(SITE_MAP.org('org_123')()).toBe('/org_123');
  });

  it('renders a static route nested under a param', () => {
    expect(SITE_MAP.org('org_123').settings()).toBe('/org_123/settings');
  });

  it('renders a param nested under a param', () => {
    expect(SITE_MAP.org('org_123').project('proj_7')()).toBe('/org_123/proj_7');
  });
});

describe('query params', () => {
  it('serializes and encodes values', () => {
    expect(SITE_MAP.auth.login({ next: '/app' })).toBe('/auth/login?next=%2Fapp');
  });

  it('skips null and undefined but keeps other falsy values', () => {
    expect(SITE_MAP.admin.users.roles({ q: null, page: undefined, active: false })).toBe(
      '/admin/users/roles?active=false',
    );
  });

  it('omits the query string when no value survives', () => {
    expect(SITE_MAP.admin.users.roles({ q: null })).toBe('/admin/users/roles');
    expect(SITE_MAP.admin.users.roles({})).toBe('/admin/users/roles');
  });

  it('appends the query string to a param route', () => {
    expect(SITE_MAP.org('org_123')({ tab: 'billing' })).toBe('/org_123?tab=billing');
  });
});
