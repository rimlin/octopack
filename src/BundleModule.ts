import * as path from 'path';
import * as walk from 'babylon-walk';

import { IBundleOptions } from './Bundle';
import collectDependencies from './visitors/dependencies';

export class BundleModule {
  name: string;
  basename: string;
  code: any;
  ast: any;
  options: IBundleOptions;
  dependencies = new Set<string>();
  modules = new Map<any, BundleModule>();

  constructor(name, options = {}) {
    this.name = name;
    this.options = options;
  }

  setCode(code: string) {
    this.code = code;
  }

  setAST(ast: any) {
    this.ast = ast;
  }

  traverse(visitor) {
    return walk.simple(this.ast, visitor, this);
  }

  collectDependencies() {
    this.traverse(collectDependencies);
  }
}