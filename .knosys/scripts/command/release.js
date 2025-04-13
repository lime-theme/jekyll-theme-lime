const { execSync } = require('child_process');

const { resolveRootPath, ensureDirExists, cp, rm, saveData } = require('../helper');

const prjRoot = resolveRootPath();
const distRoot = `${prjRoot}/dist`;

function zipTheme(dirName) {
  const fileName = `${dirName}-theme-lime.zip`;

  rm(`${distRoot}/${fileName}`);
  execSync(`zip -rm ${fileName} ${dirName}`, { stdio: 'inherit', cwd: distRoot });
}

function copyMetaFiles() {
  const distDir = `${distRoot}/jekyll`;
  const readmeTemplate = `# jekyll-theme-lime

The SSG adapter for Jekyll.

## Getting Started

Please follow the documentation [on the website](https://lime-theme.github.io).
`;

  saveData(`${distDir}/README.md`, readmeTemplate);
  cp(`${prjRoot}/CHANGELOG.md`, `${distDir}/`);
}

function copyJekyllFiles() {
  const jekyllDistRoot = `${distRoot}/jekyll`;

  ensureDirExists(jekyllDistRoot, true);

  ['template', 'asset'].forEach(type => {
    execSync(`npm run copy ${type} ${jekyllDistRoot}`, { stdio: 'inherit', cwd: prjRoot });
  });

  copyMetaFiles();
}

module.exports = {
  execute: () => {
    ensureDirExists(distRoot, true);
    copyJekyllFiles();
    zipTheme('jekyll');
  },
};
