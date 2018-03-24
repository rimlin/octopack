import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { Bundle } from './Bundle';
import { Bundler } from './Bundler';
import { Asset } from './Asset';

export class Packager {
  bundle: Bundle;
  bundler: Bundler;
  options: {};
  dest;

  constructor(bundle: Bundle, bundler: Bundler, options) {
    this.bundle = bundle;
    this.bundler = bundler;
    this.options = options;

    this.setup();
  }

  setup() {
    this.dest = createWriteStream(this.bundle.name);
    this.dest.write = promisify(this.dest.write) as any;
    this.dest.end = promisify(this.dest.end) as any;
  }

  start() {}
  addAsset(asset: Asset) {}
  end() {}
}
