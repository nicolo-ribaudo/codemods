exports.plugin = tsTypeFields;
exports.precheck = src => precheckRE.test(src);

const precheckRE = /\bclass\b/;

// NOT WORKING (recast doesn't support "declare" for fields)

/*

  ts-type-fields    Adds the "declare" keyword before type-only class fields
                    declarations in TypeScript. Starting from Babel 8.0.0,
                    fields without the "declare" keyword will be initialized to
                    "undefined" by default.
                    This codemod accepts the following options, to filer the
                    uninitialized fields to transform:
                     --all      All the uninitialized fields
                     --derived  In derived classes 
                     --readonly Readonly fields
*/

function tsTypeFields(babel, opts) {
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
          node.declare = true;
        }
      }
    }
  };
}
