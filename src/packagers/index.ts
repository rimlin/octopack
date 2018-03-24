import { Packager } from '../Packager';
import { JSPackager } from './JSPackager';

export class PackagerRegistry {
  private packagers = new Map<string, Packager>();

  constructor() {
    this.add('js', JSPackager);
  }

  add(extension, packager) {
    this.packagers.set(extension, packager);
  }

  get(extension) {
    return this.packagers.get(extension);
  }
}
