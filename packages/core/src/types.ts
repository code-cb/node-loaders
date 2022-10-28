type Awaitable<T> = T | Promise<T>;

/**
 * Reference: https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders
 */

export type NextHook<Args extends [unknown, unknown], Result> = (
  ...args: Args
) => Result;

export type HookFunction<Args extends [unknown, unknown], Result> = (
  ...args: [...args: Args, nextHook: NextHook<Args, Result>]
) => Result;

export type ModuleFormat = LoadResult['format'];

type ExtendedModuleFormat = ModuleFormat | Omit<string, ''>;

export interface ResolveContext {
  /**
   * Export conditions of the relevant `package.json`
   */
  conditions: string[];

  importAssertions: ImportAssertions;

  /**
   * The module importing this one, or undefined if this is the Node.js entry point
   */
  parentURL?: string | undefined;
}

export interface ResolveResult {
  /**
   * A hint to the load hook (it might be ignored) `'builtin' | 'commonjs' | 'json' | 'module' | 'wasm'`
   */
  format?: ExtendedModuleFormat | null | undefined;

  /**
   * A signal that this hook intends to terminate the chain of resolve hooks. Default: `false`
   */
  shortCircuit: true;

  /**
   * The absolute URL to which this input resolves
   */
  url: string;
}

/**
 * The `resolve` hook chain is responsible for resolving file URL for a given module specifier and parent URL, and optionally its format (such as `'module'`) as a hint to the `load` hook. If a format is specified, the `load` hook is ultimately responsible for providing the final `format` value (and it is free to ignore the hint provided by `resolve`); if `resolve` provides a `format`, a custom `load` hook is required even if only to pass the value to the Node.js default `load` hook.
 */
export type ResolveHook = HookFunction<
  [specifier: string, context: ResolveContext],
  Awaitable<ResolveResult>
>;

export interface LoadContext {
  /**
   * Export conditions of the relevant `package.json`
   */
  conditions: string[];

  /**
   * The format optionally supplied by the `resolve` hook chain
   */
  format?: ExtendedModuleFormat | null | undefined;

  importAssertions: ImportAssertions;
}

export type LoadResult = {
  format: string;

  /**
   * A signal that this hook intends to terminate the chain of resolve hooks. Default: `false`
   */
  shortCircuit: true;

  /**
   * The source for Node.js to evaluate
   */
  source?: string | ArrayBuffer | SharedArrayBuffer | Uint8Array | undefined;
} & (
  | { format: 'builtin' }
  | { format: 'commonjs' }
  | {
      format: 'json';
      source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array;
    }
  | {
      format: 'module';
      source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array;
    }
  | {
      format: 'wasm';
      source: ArrayBuffer | SharedArrayBuffer | Uint8Array;
    }
);

/**
 * The `load` hook provides a way to define a custom method of determining how a URL should be interpreted, retrieved, and parsed. It is also in charge of validating the import assertion.
 */
export type LoadHook = HookFunction<
  [url: string, context: LoadContext],
  Awaitable<LoadResult>
>;

export type HookMap = {
  load: LoadHook;
  resolve: ResolveHook;
};

export interface NodeLoaderConfigInput {
  loaders: HookMap[];
}

export interface ResolvedLoaders {
  load: LoadHook;
  resolve: ResolveHook;
}

export interface NodeLoaderConfig {
  loaders: HookMap[];
  resolvedLoaders: ResolvedLoaders;
}

export interface NodeLoader {
  setConfigPromise: (
    config: Promise<NodeLoaderConfigInput>,
  ) => Promise<NodeLoaderConfig>;
}
