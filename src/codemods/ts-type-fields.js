exports.plugin = tsTypeFields;
exports.precheck = src => precheckRE.test(src);

const precheckRE = /\bclass\b/;

function tsTypeFields() {
  return {
    visitor: {
      ClassProperty(path) {
        const { node } = path;
        const classNode = path.parentPath.parent;

        if (node.value) return;

        if (
          opts.all ||
          (opts.derived && classNode.superClass) ||
          (opts.readonly && node.readonly)
        ) {
          path.node.declare = true;
        }
      }
    }
  };
}
