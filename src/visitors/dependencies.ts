import * as types from 'babel-types';

import { Asset } from '../Asset';

const visitor = {
  ImportDeclaration(node, asset: Asset) {
    asset.dependencies.add(node.source.value);
  },

  ExportNamedDeclaration(node, asset: Asset) {
    if (node.source) {
      asset.dependencies.add(node.source.value);
    }
  },

  ExportAllDeclaration(node, asset: Asset) {
    asset.dependencies.add(node.source.value);
  },

  CallExpression(node, asset: Asset) {
    let {callee, arguments: args} = node;

    let isRequire = types.isIdentifier(callee)
                 && callee.name === 'require'
                 && args.length === 1
                 && types.isStringLiteral(args[0]);

    if (!isRequire) {
      return;
    }

    asset.dependencies.add(args[0].value);
  }
}

export default visitor;
