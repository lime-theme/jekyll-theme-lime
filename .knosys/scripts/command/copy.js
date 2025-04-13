const { resolve: resolvePath } = require('path');

const { resolveRootPath, copyThemeAssets, copyThemeTemplates, resolveSiteSrcDir } = require('../helper');

module.exports = {
  execute: (type = 'template', distPath) => {
    if (!['template', 'asset'].includes(type)) {
      return;
    }

    const themeDistPath = distPath || resolvePath(resolveRootPath(), resolveSiteSrcDir('default'));

    if (type === 'asset') {
      return copyThemeAssets(resolvePath(themeDistPath, '_assets'));
    }

    copyThemeTemplates(themeDistPath);
  },
};
