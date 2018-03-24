import * as workerFarm from 'worker-farm';

import { readFileAsync, writeFileAsync } from './utils';
import { Bundle } from './Bundle';
import { Resolver } from './Resolver';
import { Parser } from './Parser';
import { PackagerRegistry } from './packagers';
import { Asset } from './Asset';
import { WorkerFarm } from './WorkerFarm';

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
    this.workerFarm = new WorkerFarm({});
  }

  async bundle() {
    this.startFarm();

    const mainAsset = await this.resolveAsset(this.mainFilename);

    await this.bundleAssets(mainAsset);
    const bundle = this.createBundleTree(mainAsset);

    bundle.package(this);
    this.endFarm();

    return mainAsset;
  }

  async bundleAssets(mainAsset: Asset) {
    return await this.loadAsset(mainAsset);
  }

  createBundleTree(asset: Asset, bundle?: Bundle) {
    if (!bundle) {
      bundle = new Bundle(asset.type, asset.generateBundleName());
      bundle.entryAsset = asset;
    }

    bundle.getSiblingBundle(asset.type).addAsset(asset);
    asset.parentBundle = bundle;

    for (let assetDep of asset.depAssets.values()) {
      this.createBundleTree(assetDep, bundle);
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

    const processed = await this.workerFarm.process(asset.filename);
    const dependencies = processed.dependencies;
    asset.generated = processed.generated;

    return await Promise.all(dependencies.map(async dependencyFilename => {
      const assetDep = await this.resolveAsset(dependencyFilename, asset.filename);

      asset.depAssets.set(assetDep.filename, assetDep);
      asset.dependencies.add(dependencyFilename);

      await this.loadAsset(assetDep);
    }));
  }

  startFarm() {
    this.workerFarm = new WorkerFarm({});
  }

  endFarm() {
    this.workerFarm.end();
  }
}
