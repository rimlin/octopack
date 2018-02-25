import { Asset, AssetOptions } from '../Asset';

export default class JSAsset extends Asset {
  constructor(filename, options: AssetOptions) {
    super(filename, options);
  }
}
