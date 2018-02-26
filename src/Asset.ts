import { extname } from 'path';

import { readFileAsync } from './utils';

export interface AssetOptions {

}

export class Asset {
  processed: boolean;
  dependencies = new Set<string>();
  depAssets = new Map<string, Asset>();
  filename: string;
  generated: string;
  ast: any;
  content: any;
  encoding = 'utf8';
  type: 'js' | 'json';
  isES6Module: boolean = false;
  isAstDirty: boolean = false;

  constructor(filename: string, options: AssertionOptions) {
    this.filename = filename;
    this.type = extname(filename).slice(1) as 'js' | 'json';
  }

  addDependency(filenameDep) {
    this.dependencies.add(filenameDep);
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
}
