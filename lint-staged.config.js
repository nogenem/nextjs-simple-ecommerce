const path = require('path');

const getRelativePaths = (paths) =>
  paths.map((p) => path.relative(process.cwd(), p));

// https://github.com/microsoft/TypeScript/issues/27379#issuecomment-883154194
// https://nextjs.org/docs/basic-features/eslint#lint-staged
module.exports = {
  '*': (paths) => {
    try {
      const relativePaths = getRelativePaths(paths);
      const filteredPaths = relativePaths.filter((path) =>
        path.match(/.*\.(jsx?|tsx?)$/i),
      );

      const cmds = [];
      if (filteredPaths.length > 0) {
        cmds.push(`next lint --fix --file ${filteredPaths.join(' --file ')}`);
      }
      cmds.push(`prettier --ignore-unknown --write ${paths.join(' ')}`);

      return cmds;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  '*.{ts,tsx}': () => 'tsc --noEmit',
};
