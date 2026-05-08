/** Query parameter value types that can be serialized to a URL string */
export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type RouteFunction<TQuery extends QueryParams = QueryParams> = {
  (): string;
  (query: TQuery): string;
}

export type RouteUtils = {
  makeRoute<TQuery extends QueryParams = QueryParams, T = {}>(
    segment: string,
    cb?: (utils: RouteUtils) => T,
  ): T & RouteFunction<TQuery>;
  param<TQuery extends QueryParams = QueryParams, T = {}>(
    cb: (utils: RouteUtils) => T,
  ): (id: string) => T & RouteFunction<TQuery>;
}

const serializeQuery = (query: QueryParams): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const createRouteFunction = (fullPath: string): RouteFunction => {
  return (query?: QueryParams): string => {
    if (query && Object.keys(query).length > 0) {
      return `${fullPath}${serializeQuery(query)}`;
    }
    return fullPath;
  };
};

const createMakeRoute = (parentPath: string = ''): RouteUtils['makeRoute'] => {
  return <TQuery extends QueryParams = QueryParams, T = {}>(
    segment: string,
    cb?: (utils: RouteUtils) => T,
  ): T & RouteFunction<TQuery> => {
    const fullPath = `${parentPath}/${segment}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    const route = createRouteFunction(fullPath);
    if (!cb) return Object.assign(route, {} as T) as T & RouteFunction<TQuery>;

    const createParam = (basePath: string) => {
      return <TQ extends QueryParams = QueryParams, TT = {}>(
        paramCb: (utils: RouteUtils) => TT,
      ) => {
        return (id: string): TT & RouteFunction<TQ> => {
          const paramPath = `${basePath}/${id}`;
          const paramRoute = createRouteFunction(paramPath);
          const paramUtils: RouteUtils = {
            makeRoute: createMakeRoute(paramPath),
            param: createParam(paramPath),
          };
          return Object.assign(paramRoute, paramCb(paramUtils)) as TT & RouteFunction<TQ>;
        };
      };
    };

    const utils: RouteUtils = {
      makeRoute: createMakeRoute(fullPath),
      param: createParam(fullPath),
    };
    return Object.assign(route, cb(utils)) as T & RouteFunction<TQuery>;
  };
};

/**
 * Creates a fully-typed site map from a route tree.
 *
 * @example
 * export const SITE_MAP = createSiteMap(({ makeRoute }) => ({
 *   DASHBOARD: makeRoute('dashboard'),
 *   AUTH: makeRoute('auth', ({ makeRoute }) => ({
 *     LOGIN: makeRoute<{ callbackUrl?: string }>('login'),
 *   })),
 * }));
 *
 * SITE_MAP.AUTH.LOGIN()                        // '/auth/login'
 * SITE_MAP.AUTH.LOGIN({ callbackUrl: '/app' }) // '/auth/login?callbackUrl=%2Fapp'
 */
export const createSiteMap = <T>(cb: (utils: RouteUtils) => T): T & RouteFunction => {
  const makeRoute = createMakeRoute('');
  return makeRoute('/', cb);
};
