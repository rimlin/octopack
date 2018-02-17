import { Bundle } from '../src/Bundle';
import { BundleModule } from 'BundleModule';

process.on('unhandledRejection', console.error)

async function run() {
  let bundle = new Bundle('/mnt/d/Dev/diplom/test/test.js', {});
  //let bundle = new Bundle('D:\\Dev\\diplom\\test\\test.js', {});
  let module = await bundle.collectDependencies();

  printDeps(module);
}

function printDeps(mainBundleModule: BundleModule, indent = '', deps = new Set) {
  for (let bundleModule of mainBundleModule.modules.values()) {
    console.log(indent + bundleModule.name);
    if (!deps.has(bundleModule.name)) {
      deps.add(bundleModule.name);
      printDeps(bundleModule, indent + '  ', deps);
	  // babel.transformFromAst(mod.ast);
    }
  }
}

run().then(console.log, console.error);
