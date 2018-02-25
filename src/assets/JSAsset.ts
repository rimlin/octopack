import traverse from 'babel-traverse';
import * as walk from 'babylon-walk';
import * as babylon from 'babylon';
import babel from '../transforms/babel';
import generate from 'babel-generator';

import { Asset, AssetOptions } from '../Asset';
import collectDependencies from '../visitors/dependencies';

const IMPORT_RE = /\b(?:import\b|export\b|require\s*\()/;
const GLOBAL_RE = /\b(?:process|__dirname|__filename|global|Buffer)\b/;
const FS_RE = /\breadFileSync\b/;


export default class JSAsset extends Asset {
  constructor(filename, options: AssetOptions) {
    super(filename, options);

    this.type = 'js';
  }

  mightHaveDependencies() {
    return IMPORT_RE.test(this.content) || GLOBAL_RE.test(this.content);
  }

  async parse(code) {
    const options = {
      filename: this.filename,
      allowReturnOutsideFunction: true,
      allowHashBang: true,
      ecmaVersion: Infinity,
      strictMode: false,
      sourceType: 'module',
      locations: true,
      plugins: [
        'exportExtensions',
        'dynamicImport'
      ]
    };

    return babylon.parse(code, options);
  }

  traverse(visitor) {
    return traverse(this.ast, visitor, null, this);
  }

  traverseFast(visitor) {
    return walk.simple(this.ast, visitor, this);
  }

  collectDependencies() {
    return this.traverseFast(collectDependencies);
  }

  async pretransform() {
    await babel(this);
  }

  async transform() {
    if (this.isES6Module) {
      await babel(this);
    }
  }

  generate() {
    let code = this.isAstDirty ? generate(this.ast).code : this.content;

    return code;
  }
}
