import { readFileAsync } from './utils';
import { Parser } from './Parser';
import { BundleModule } from './BundleModule';

process.on('unhandledRejection', console.error);

let parser;

module.exports = async function(path, options, callback) {
  if (!parser) {
    parser = new Parser(options || {});
  }

  const bundleModule = new BundleModule(path, options);

  bundleModule.setCode(await readFileAsync(path, 'utf-8'));
  bundleModule.setAST(parser.parse(path, bundleModule.code));
  bundleModule.collectDependencies();

  callback(null, Array.from(bundleModule.dependencies));
};
