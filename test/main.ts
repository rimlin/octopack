import { Bundler } from '../src/Bundler';

process.on('unhandledRejection', console.error)

async function run() {
  // let bundler = new Bundler('/mnt/d/Dev/diplom/test/test.js', {});
  let bundler = new Bundler('D:\\Dev\\diplom\\test\\test.js', {});
  let bundle = await bundler.bundle();

  printDeps(bundle);
}

function printDeps(bundle: any, indent = '', deps = new Set) {
  console.log(bundle);
}

run().then(console.log, console.error);
