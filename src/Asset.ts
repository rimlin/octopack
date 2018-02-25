
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

  constructor(filename: string, options: AssertionOptions) {
    this.filename = filename;
  }

  process() {
    // process data, generate AST & code
  }
}
