import * as path from 'path';
import * as walk from 'babylon-walk';

import { Bundler } from './Bundler';
import { Asset } from './Asset';
import { FileType } from './enums';
import { Packager } from 'Packager';

export class Bundle {
  entryAsset: Asset;
  assets = new Set<Asset>();
  name: string;
  type: FileType;
  options: {};
  parentBundle: Bundle;
  childBundles = new Set<Bundle>();
  siblingBundles = new Map<FileType, Bundle>();

  constructor(type: FileType, name: string, parent?: Bundle) {
    this.type = type;
    this.name = name;
    this.parentBundle = parent;
  }

  addAsset(asset: Asset) {
    this.assets.add(asset);
    asset.bundles.add(this);
  }

  getSiblingBundle(type: FileType): Bundle {
    if (type === this.type) {
      return this;
    }

    if (this.siblingBundles.has(type) === false) {
      let bundle = this.createChildBundle(type, this.getSiblingName(type));
      this.siblingBundles.set(type, bundle);
    }

    return this.siblingBundles.get(type);
  }

  createChildBundle(type: FileType, name: string): Bundle {
    let bundle = new Bundle(type, name, this);
    this.childBundles.add(bundle);

    return bundle;
  }

  async package(bundler: Bundler) {
    let promises = [];

    promises.push(this.internalPackage(bundler));

    for (let bundle of this.childBundles) {
      promises.push(bundle.package(bundler));
    }

    await Promise.all(promises);
  }

  async internalPackage(bundler: Bundler) {
    const Packager = bundler.packagerRegistry.get(this.type) as any;
    const packager = new Packager(this, bundler, {});

    await packager.start();

    let included = new Set();

    for (let asset of this.assets) {
      await this.addDeps(asset, packager, included);
    }

    await packager.end();
  }

  async addDeps(asset: Asset, packager: Packager, included: Set<Asset>) {
    if (included.has(asset)) {
      return;
    }

    included.add(asset);

    for (let depAsset of asset.depAssets.values()) {
      await this.addDeps(depAsset, packager, included);
    }

    await packager.addAsset(asset);
  }

  private getSiblingName(type: FileType): string {
    return path.join(
      path.dirname(this.name),
      path.basename(this.name, path.extname(this.name)) +
      '.' + type
    );
  }
}
