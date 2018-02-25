import { Asset, AssetOptions } from '../Asset';

export default class JSONAsset extends Asset {
  constructor(filename, options: AssetOptions) {
    super(filename, options);
  }
}
