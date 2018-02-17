import * as types from 'babel-types';

import { BundleModule } from '../BundleModule';

const visitor = {
  ImportDeclaration(node, bundleModule: BundleModule) {
    bundleModule.dependencies.add(node.source.value);
  },

  ExportNamedDeclaration(node, bundleModule: BundleModule) {
    if (node.source) {
      bundleModule.dependencies.add(node.source.value);
    }
  },

  ExportAllDeclaration(node, bundleModule: BundleModule) {
    bundleModule.dependencies.add(node.source.value);
  },

  CallExpression(node, bundleModule: BundleModule) {
    let {callee, arguments: args} = node;

    let isRequire = types.isIdentifier(callee)
                 && callee.name === 'require'
                 && args.length === 1
                 && types.isStringLiteral(args[0]);

    if (!isRequire) {
      return;
    }

    bundleModule.dependencies.add(args[0].value);
  }
}

export default visitor;
