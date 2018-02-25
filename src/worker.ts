import { readFileAsync } from './utils';
import { Parser } from './Parser';

process.on('unhandledRejection', console.error);

const parser = new Parser({});

export async function run(filename) {
  const asset = parser.getAsset(filename);
  await asset.process();

  return {
    dependencies: Array.from(asset.dependencies.values()),
    generated: asset.generated
  };
};
