import { Bundler } from '../src/Bundler';
import { Asset } from '../src/Asset';

process.on('unhandledRejection', console.error)

async function run() {
  let bundler = new Bundler('/mnt/d/Dev/diplom/test/test.js', {});
  //let bundler = new Bundler('D:\\Dev\\diplom\\test\\index.html', {});
  let bundle = await bundler.bundle();

  printDeps(bundle);
}

function printDeps(bundle: Asset, indent = '', deps = new Set) {
  for (let asset of bundle.depAssets.values()) {
    console.log(indent + asset.filename);
    if (!deps.has(asset.filename)) {
      deps.add(asset.filename);
      printDeps(asset, indent + '  ', deps);
    }
  }
}

run().then(console.log, console.error);
