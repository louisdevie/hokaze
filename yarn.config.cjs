/** @type {import('@yarnpkg/types')} */
const {defineConfig} = require('@yarnpkg/types');

/**
 * This rule will enforce that the same metadata is present on all published packages.
 * @param {Yarn} context
 */
function enforceMetadata(context) {
  for (const workspace of context.workspaces()) {
    if (!workspace.manifest.private) {
      workspace.set("author", "Louis Devie");
      workspace.set("homepage", "https://github.com/louisdevie/hokaze");
      workspace.set("repository", "https://github.com/louisdevie/hokaze");
      workspace.set("issues", "https://github.com/louisdevie/hokaze/issues");
      workspace.set("license", "MIT");
      workspace.set("type", "module");
      workspace.set("main", "./dist/index.cjs");
      workspace.set("module", "./dist/index.js");
      workspace.set("types", "./dist/index.d.ts");
      workspace.set("files", ["dist"]);
    }
  }
}

/**
 * This rule enforces that devDependencies declared in workspaces match the version declared in the root package.json.
 * @param {Yarn} context
 */
function enforceSameDevDependencies(context) {
  const rootWorkspace = context.workspace({cwd: '.'});
  const rootDevDependencies = context.dependencies({workspace: rootWorkspace, type: "devDependencies"})
  for (const devDependency of context.dependencies({type: "devDependencies"})) {
    if (devDependency.workspace !== rootWorkspace) {
      const rootDevDependency = rootDevDependencies.find(dep => dep.ident === devDependency.ident);
      if (rootDevDependency) {
        devDependency.update(rootDevDependency.range)
      }
    }
  }
}

module.exports = defineConfig({
  async constraints({Yarn}) {
    enforceMetadata(Yarn)
    enforceSameDevDependencies(Yarn)
  },
})
