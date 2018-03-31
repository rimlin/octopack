import { extname } from 'path';
import * as cuid from 'cuid';

import { readFileAsync, convertExtensionToFileType } from './utils';
import { FileType } from './enums';
import { Bundle } from './Bundle';

export interface AssetOptions {

}

let ASSET_ID = 1;

export class Asset {
  id = ASSET_ID++;
  processed: boolean;
  dependencies = new Set<string>();
  depAssets = new Map<string, Asset>();
  filename: string;
  generated: string;
  ast: any;
  content: any;
  encoding = 'utf8';
  type: FileType;
  isES6Module = false;
  isAstDirty = false;
  parentBundle: Bundle;
  bundles = new Set<Bundle>();

  constructor(filename: string, options: AssertionOptions) {
    this.filename = filename;
    this.type = convertExtensionToFileType(extname(filename).slice(1));
  }

  addDependency(depName) {
    this.dependencies.add(depName);
  }

  addDependencyUrl(filename) {

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
    const extension = extname(this.filename);
    return this.filename.slice(0, -extension.length) + '-' + cuid().slice(5,10) + extension;
  }
}
