import * as babel from '@babel/core';
import { Asset } from '../Asset';

export default async function (asset: Asset) {
   await asset.parseIfNeeded();

  let config = {
    code: false,
    filename: asset.filename,
    plugins: [],
  };

  if (asset.isES6Module) {
    config.plugins = [require('@babel/plugin-transform-modules-commonjs')];
  }

  let res = babel.transformFromAst(asset.ast, asset.content, config);
  asset.ast = res.ast;
  asset.isAstDirty = true;
};
