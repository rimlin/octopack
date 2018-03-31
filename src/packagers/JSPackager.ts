import { readFileSync } from 'fs';
import { Bundle } from '../Bundle';
import { Bundler } from '../Bundler';
import { Packager } from '../Packager';
import { Asset } from '../Asset';

const prelude = readFileSync(__dirname + '/../builtins/prelude.js', 'utf8').trim();

export class JSPackager extends Packager {
  first = true;
  dedupe = new Map<number, string>();

  constructor(bundle: Bundle, bundler: Bundler, options) {
    super(bundle, bundler, options);
  }

  async start() {
    await this.dest.write(prelude + '({');
  }

  async addAsset(asset: Asset) {
    if (this.dedupe.has(asset.id)) {
      return;
    }

    this.dedupe.set(asset.id, asset.generated);

    let deps = {};
    for (let depName of asset.dependencies.values()) {
      const depAsset = asset.depAssets.get(depName);
      deps[depName] = depAsset.id;
    }

    await this.writeModule(asset.id, asset.generated, deps);
  }

  async end() {
    await this.dest.end('},' + this.bundle.entryAsset.id + ')');
  }

  private async writeModule(id: number, code: string, deps = {}) {
    let wrapped = this.first ? '' : ',';
    wrapped += id + ':[function(require,module,exports) {\n' + (code || '') + '\n},';
    wrapped += JSON.stringify(deps);
    wrapped += ']';

    this.first = false;
    await this.dest.write(wrapped);
  }
}
