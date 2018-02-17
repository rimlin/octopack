import { extname } from 'path';

import { PARSERS } from './parsers';

export class Parser {
  extensions = {};

  constructor(options = {}) {
    PARSERS.forEach(({ extnames, parser }) => {
      extnames.forEach(extname => this.registerParser(extname, parser));
    });
  }

  registerParser(extname, parser) {
    this.extensions[extname] = parser;
  }

  getParser(filename) {
    const extension = extname(filename);
    const parser = this.extensions[`${extension}`];

    if (!parser) {
      throw new Error(`Could not find parser for extension ${extension}`);
    }

    return parser;
  }

  parse(filename, code) {
    const parser = this.getParser(filename);
    const options = { filename };

    return parser(code, options);
  }
}
