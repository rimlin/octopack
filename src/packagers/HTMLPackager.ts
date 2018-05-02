import { Packager } from '../Packager';

export class HTMLPackager extends Packager {
  async addAsset(asset) {
    let html = asset.generated.html || '';

    await this.dest.write(html);
  }
}
