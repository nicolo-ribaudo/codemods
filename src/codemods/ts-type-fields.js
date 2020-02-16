exports.plugin = tsTypeFields;
exports.precheck = src => precheckRE.test(src);

const precheckRE = /\bclass\b/;

function tsTypeFields() {
  return {
    visitor: {
      ClassProperty(path) {
        if (path.node.typeAnnotation && !path.node.value) {
          path.node.declare = true;
        }
      }
    }
  };
}
