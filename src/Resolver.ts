import * as _resolve from 'browser-resolve';
import * as builtins from 'node-libs-browser';
import * as path from 'path';

import { promisify } from './utils';

const resolve = promisify(_resolve);

for (let key in builtins) {
  if (!builtins[key]) {
    builtins[key] = require.resolve('./utils/_empty');
  }
}

export class Resolver {
  options: {
    paths?: any;
  } = {};
  cache = new Map();

  constructor(options = {}) {
    this.options = options;
  }

  async resolve(filename, parent) {
    const key = (parent ? path.dirname(parent) : '') + ':' + filename;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    let res = await resolve(filename, {
      filename: parent,
      paths: this.options.paths,
      modules: builtins,
    });

    if (Array.isArray(res)) {
      res = res[0];
    }

    this.cache.set(key, res);

    return res;
  }
}
