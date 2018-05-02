import * as parse from 'posthtml-parser';
import * as api from 'posthtml/lib/api';
import * as path from 'path';
import * as render from 'posthtml-render';

import { Asset, AssetOptions } from '../Asset';
import { FileType } from '../enums';

// A list of all attributes that should produce a dependency
// Based on https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const ATTRS = {
  src: ['script', 'img', 'audio', 'video', 'source', 'track', 'iframe', 'embed'],
  href: ['link', 'a'],
  poster: ['video']
};

export default class HTMLAsset extends Asset {
  constructor(filename, options: AssetOptions) {
    super(filename, options);

    this.type = FileType.HTML;
    this.isAstDirty = false;
  }

  parse(code) {
    let res = parse(code);
    res.walk = api.walk;
    res.match = api.match;
    return res;
  }

  collectDependencies() {
    this.ast.walk(node => {
      if (node.attrs) {
        for (let attr in node.attrs) {
          let elements = ATTRS[attr];
          if (elements && elements.includes(node.tag)) {
            node.attrs[attr] = path.join(this.options.publicURL, this.addURLDependency(node.attrs[attr]));
            this.isAstDirty = true;
          }
        }
      }

      return node;
    });

    return Promise.resolve();
  }

  generate() {
    let html = this.isAstDirty ? render(this.ast) : this.content;

    return { html };
  }
}
