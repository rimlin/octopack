import * as workerFarm from 'worker-farm';

import { promisify, readFileAsync, writeFileAsync } from './utils';
import { Bundle } from './Bundle';
import { Resolver } from './Resolver';
import { Parser } from './Parser';
import { Asset } from './Asset';
import { WorkerFarm } from './WorkerFarm';

export interface BundleOptions {

}

export class Bundler {
  mainFilename: string;
  options: BundleOptions;
  parser: Parser;
  resolver: Resolver;
  workerFarm: WorkerFarm;
  mainAsset: Asset;

  loadedAssets = new Map<string, Asset>();

  constructor(mainFilename: string, options: BundleOptions) {
    this.mainFilename = mainFilename;
    this.options = options;

    this.parser = new Parser({});
    this.resolver = new Resolver({});
    this.workerFarm = new WorkerFarm({});
  }

  async bundle() {
    this.startFarm();

    const mainAsset = await this.resolveAsset(this.mainFilename);

    const result = await this.bundleAssets(mainAsset);

    this.endFarm();

    return result;
  }

  async bundleAssets(mainAsset: Asset) {
    return await this.loadAsset(mainAsset);
  }

  async resolveAsset(filename: string, parent?: string): Promise<Asset> {
    const path = await this.resolver.resolve(filename, parent);

    if (this.loadedAssets.has(path)) {
      return this.loadedAssets.get(path);
    }

    const asset = this.parser.getAsset(filename);
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

      asset.depAssets.set(assetDep.filename, asset);
      asset.dependencies.add(dependencyFilename);

      return await this.loadAsset(assetDep);
    }));
  }

  startFarm() {
    this.workerFarm = new WorkerFarm({});
  }

  endFarm() {
    this.workerFarm.end();
  }
}
