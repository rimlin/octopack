import { extname } from 'path';

import { Asset } from './Asset';

export class Parser {
  extensions = {};

  constructor(options = {}) {
    this.registerExtensions(['js', 'jsx', 'es6'], './assets/JSAsset');
    this.registerExtensions(['json'], './assets/JSONAsset');
  }

  getExtensions() {
    return this.extensions;
  }

  getAsset(filename): Asset {
    const TargetAsset = this.findAsset(filename);
    return new TargetAsset(filename);
  }

  private registerExtensions(extnames, assetParser): void {
    extnames.forEach((extname: string) => {
      if (!extname.startsWith('.')) {
        extname = `.${extname}`;
      }

      this.extensions[extname] = assetParser;
    });
  }

  private findAsset(filename): new(filename: string) => Asset {
    const extension = extname(filename);
    let asset = this.extensions[extension];

    if (!asset) {
      throw new Error(`Could not find parser for extension ${extension}`);
    }

    if (typeof asset === 'string') {
      asset = this.extensions[extension] = require(asset).default;
    }

    return asset;
  }
}
