import * as path from 'path';
import * as cuid from 'cuid';

import { readFileAsync, convertExtensionToFileType } from './utils';
import { FileType } from './enums';
import { Bundle } from './Bundle';
import { Parser } from './Parser';

export interface AssetOptions {
  publicURL: '',
  parser?: Parser
}

export interface Dependency {
  name: string;
  dynamic: boolean;
}

let ASSET_ID = 1;

export class Asset {
  id = ASSET_ID++;
  processed: boolean;
  dependencies = new Map<string, Dependency>();
  depAssets = new Map<string, Asset>();
  filename: string;
  generated: {
    js?: string;
    html?: string;
  };
  ast: any;
  content: any;
  encoding = 'utf8';
  type: FileType;
  isES6Module = false;
  isAstDirty = false;
  parentBundle: Bundle;
  bundles = new Set<Bundle>();
  options: AssetOptions = {
    publicURL: ''
  };

  constructor(filename: string, options: AssetOptions) {
    this.filename = filename;
    this.options = options;
    this.type = convertExtensionToFileType(path.extname(filename).slice(1));
  }

  addDependency(name, opts) {
    this.dependencies.set(name, Object.assign({name}, opts));
  }

  addURLDependency(url) {
    if (!url) {
      return url;
    }

    let resolved = path.resolve(path.dirname(this.filename), url).replace(/[\?#].*$/, '');
    this.addDependency('./' + path.relative(path.dirname(this.filename), resolved), {dynamic: true});
    return this.options.parser.getAsset(resolved).generateBundleName();
  }

  async loadIfNeeded() {
    if (this.content == null) {
      this.content = await this.loadFile();
    }
  }

  async parseIfNeeded() {
    if (this.ast == null) {
      await this.loadIfNeeded();

      this.ast = await this.parse(this.content);
    }
  }

  async getDependencies() {
    await this.loadIfNeeded();
    await this.parseIfNeeded();
    await this.collectDependencies();
  }

  async loadFile(): Promise<any> {
    return await readFileAsync(this.filename, this.encoding);
  }

  async parse(code: string): Promise<any> {}
  async collectDependencies(): Promise<any> {}
  async transform(): Promise<any> {}
  generate(): any {}

  async process() {
    if (!this.generated) {
      await this.getDependencies();
      await this.transform();
      this.generated = this.generate();
    }
  }

  generateBundleName(): string {
    const extension = path.extname(this.filename);
    return this.filename.slice(0, -extension.length) + '-' + cuid().slice(5,10) + extension;
  }
}
