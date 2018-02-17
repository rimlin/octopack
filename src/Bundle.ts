import * as workerFarm from 'worker-farm';

import { promisify, readFileAsync, writeFileAsync } from './utils';
import { BundleModule } from './BundleModule';
import { Resolver } from './Resolver';
import { Parser } from './Parser';

export interface IBundleOptions {

}

export class Bundle {
  mainFile: string;
  options: IBundleOptions;
  resovler: Resolver;
  loadedModules = new Map<string, BundleModule>();
  loading = new Set<BundleModule>();
  farm: Workers = workerFarm({ autoStart: true }, require.resolve('./worker'));
  runFarm = promisify(this.farm);

  constructor(main: string, options: IBundleOptions) {
    this.mainFile = main;
    this.options = options;
    this.resovler = new Resolver(options);
  }

  async collectDependencies() {
    const mainBundleModule = await this.resolveModule(this.mainFile);
    await this.loadBundleModule(mainBundleModule);

    workerFarm.end(this.farm);
    return mainBundleModule;
  }

  async resolveModule(name: string, parent?: string) {
    const path = await this.resovler.resolve(name, parent);

    if (this.loadedModules.has(path)) {
      return this.loadedModules.get(path);
    }

    const bundleModule = new BundleModule(path, this.options);
    this.loadedModules.set(path, bundleModule);

    return bundleModule;
  }

  async loadBundleModule(bundleModule: BundleModule): Promise<any> {
    if (this.loading.has(bundleModule)) {
      return;
    }

    this.loading.add(bundleModule);

    const dependencies = await this.runFarm(bundleModule.name, this.options);
    bundleModule.dependencies = dependencies;

    return await Promise.all(dependencies.map(async dependency => {
      const childBundleModule = await this.resolveModule(dependency, bundleModule.name);
      bundleModule.modules.set(dependency, childBundleModule);

      return await this.loadBundleModule(childBundleModule);
    }));
  }
}
