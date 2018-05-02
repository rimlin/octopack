import { Packager } from '../Packager';
import { JSPackager } from './JSPackager';
import { HTMLPackager } from './HTMLPackager';

export class PackagerRegistry {
  private packagers = new Map<string, Packager>();

  constructor() {
    this.add('js', JSPackager);
    this.add('html', HTMLPackager);
  }

  add(extension, packager) {
    this.packagers.set(extension, packager);
  }

  get(extension) {
    return this.packagers.get(extension);
  }
}
