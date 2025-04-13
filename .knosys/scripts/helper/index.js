const { resolve: resolvePath } = require('path');
const { existsSync } = require('fs');
const { pick } = require('@ntks/toolbox');

const ksUtils = require('./knosys');

function resolveSiteSrcDir(site) {
  return ksUtils.getConfig(`site.${site}.source`) || `./.knosys/sites/${site}`;
}

function resolveSiteSrcPath(site) {
  return resolvePath(ksUtils.resolveRootPath(), resolveSiteSrcDir(site));
}

function getSiteRoot() {
  return resolveSiteSrcPath('default');
}

function getLocalDataRoot() {
  return `${getSiteRoot()}/source/_data/knosys`;
}

function getLocalDocRoot() {
  return `${getSiteRoot()}/source/knosys`;
}

function copyThemeAssets(distRoot, polyfill) {
  const srcRootPath = resolvePath(ksUtils.resolveRootPath(), process.env.KSIO_LIME_SRC);

  if (!existsSync(srcRootPath)) {
    return;
  }

  ['fonts', 'images', 'javascripts', 'stylesheets'].forEach(dirName => {
    const assetsPath = `${distRoot}/${dirName}`;

    ksUtils.ensureDirExists(assetsPath);

    const srcPath = resolvePath(srcRootPath, dirName);
    const distPath = `${distRoot}/${dirName}/ksio`;

    ksUtils.ensureDirExists(distPath, true);
    ksUtils.copyFileDeeply(srcPath, distPath, polyfill ? [] : ['polyfills']);
  });

  const distStyleDirPath = `${distRoot}/stylesheets/ksio/`;

  const shareSnsStyleFilePath = `${distStyleDirPath}/vendors/share.scss`;
  const shareSnsStyleFileContent = ksUtils.readData(shareSnsStyleFilePath);

  if (!polyfill) {
    return ksUtils.saveData(shareSnsStyleFilePath, shareSnsStyleFileContent.replace(new RegExp('fonts/vendors/share', 'g'), 'ksio/vendors/share'));
  }

  ksUtils.saveData(shareSnsStyleFilePath, shareSnsStyleFileContent.replace(new RegExp('fonts/vendors/share', 'g'), '../../../fonts/ksio/vendors/share').replace(new RegExp('font-url', 'g'), 'url'));

  const faStyleFilePath = `${distStyleDirPath}/polyfills/_font-awesome-sprockets.scss`;

  ksUtils.saveData(faStyleFilePath, ksUtils.readData(faStyleFilePath).replace(' font-path($path)', ' "../fonts/ksio/polyfills/#{$path}"'));

  ['_all', '_bootstrap-custom', '_helper', '_painter'].forEach(fileName => {
    const filePath = `${distStyleDirPath}/${fileName}.scss`;
    const bsStr = fileName === '_all' ? 'bootstrap-sprockets' : 'bootstrap';

    ksUtils.saveData(
      filePath,
      ksUtils.readData(filePath)
        .replace(new RegExp('@import "compass', 'g'), '@import "./polyfills/compass')
        .replace(new RegExp(`@import "${bsStr}`, 'g'), `@import "./polyfills/${bsStr}`)
        .replace(new RegExp('@import "font-awesome', 'g'), '@import "./polyfills/font-awesome'),
    );
  });
}

function copyThemeTemplates(distRoot) {
  const srcRootPath = resolvePath(ksUtils.resolveRootPath(), 'src');

  ['_includes', '_layouts'].forEach(dirName => {
    const distPath = `${distRoot}/${dirName}/ksio`;

    ksUtils.ensureDirExists(distPath, true);
    ksUtils.copyFileDeeply(`${srcRootPath}/${dirName}/ksio`, distPath);
  });
}

module.exports = {
  ...ksUtils,
  resolveSiteSrcDir, resolveSiteSrcPath,
  getLocalDataRoot, getLocalDocRoot,
  copyThemeAssets, copyThemeTemplates,
};
