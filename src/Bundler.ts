import * as workerFarm from 'worker-farm';

import { readFileAsync, writeFileAsync } from './utils';
import { Bundle } from './Bundle';
import { Resolver } from './Resolver';
import { Parser } from './Parser';
import { PackagerRegistry } from './packagers';
import { Asset, Dependency } from './Asset';

export interface BundleOptions {

}

export class Bundler {
  mainFilename: string;
  options: BundleOptions;
  parser: Parser;
  packagerRegistry: PackagerRegistry;
  resolver: Resolver;
  workerFarm: WorkerFarm;
  mainAsset: Asset;

  loadedAssets = new Map<string, Asset>();

  constructor(mainFilename: string, options: BundleOptions) {
    this.mainFilename = mainFilename;
    this.options = options;

    this.parser = new Parser({});
    this.packagerRegistry = new PackagerRegistry();
    this.resolver = new Resolver({
      extensions: Object.keys(this.parser.getExtensions())
    });
  }

  async bundle() {
    const mainAsset = await this.resolveAsset(this.mainFilename);

    await this.bundleAssets(mainAsset);
    const bundle = this.createBundleTree(mainAsset);

    bundle.package(this);
    return mainAsset;
  }

  async bundleAssets(mainAsset: Asset) {
    return await this.loadAsset(mainAsset);
  }

  createBundleTree(asset: Asset, dep?: Dependency, bundle?: Bundle) {
    if (!bundle) {
      bundle = new Bundle(asset.type, asset.generateBundleName());
      bundle.entryAsset = asset;
    }

    if (dep && dep.dynamic) {
      bundle = bundle.createChildBundle(asset.type, asset.generateBundleName());
      bundle.entryAsset = asset;
    }

    bundle.getSiblingBundle(asset.type).addAsset(asset);
    asset.parentBundle = bundle;

    for (let dep of asset.dependencies.values()) {
      const assetDep = asset.depAssets.get(dep.name);
      this.createBundleTree(assetDep, dep, bundle);
    }

    return bundle;
  }

  async resolveAsset(filename: string, parent?: string): Promise<Asset> {
    const path = await this.resolver.resolve(filename, parent);

    if (this.loadedAssets.has(path)) {
      return this.loadedAssets.get(path);
    }

    const asset = this.parser.getAsset(path);
    this.loadedAssets.set(path, asset);

    return asset;
  }

  async loadAsset(asset: Asset): Promise<any> {
    if (asset.processed) {
      return;
    }

    asset.processed = true;

    const processed = await this.processFile(asset.filename);
    const dependencies = processed.dependencies;
    asset.generated = processed.generated;

    return await Promise.all(dependencies.map(async dep => {
      const assetDep = await this.resolveAsset(dep.name, asset.filename);

      asset.depAssets.set(dep.name, assetDep);
      asset.dependencies.set(dep.name, dep);

      await this.loadAsset(assetDep);
    }));
  }

  async processFile(filename: string) {
    const asset = this.parser.getAsset(filename);
    await asset.process();

    return {
      dependencies: Array.from(asset.dependencies.values()),
      generated: asset.generated
    };
  }
}
