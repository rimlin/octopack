import * as _resolve from 'browser-resolve';
import * as builtins from 'node-libs-browser';
import * as path from 'path';
import { promisify } from 'util';

const resolve = promisify(_resolve);

for (let key in builtins) {
  if (!builtins[key]) {
    builtins[key] = require.resolve('./utils/_empty');
  }
}

export interface ResolverOptions {
  extensions?: Array<string>;
}

export class Resolver {
  options: ResolverOptions = {};
  cache = new Map();

  constructor(options: ResolverOptions) {
    this.options = options;
  }

  async resolve(filename, parent) {
    var resolved = await this.resolveInternal(filename, parent);
    return this.saveCache(filename, parent, resolved);
  }

  async resolveInternal(filename, parent) {
    const key = this.getCacheKey(filename, parent);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    return await resolve(filename, {
      filename: parent,
      modules: builtins,
      extensions: this.options.extensions
    });
  }

  getCacheKey(filename, parent) {
    return (parent ? path.dirname(parent) : '') + ':' + filename;
  }

  saveCache(filename, parent, resolved) {
    if (Array.isArray(resolved)) {
      resolved = resolved[0];
    }

    this.cache.set(this.getCacheKey(filename, parent), resolved);
    return resolved;
  }
}
