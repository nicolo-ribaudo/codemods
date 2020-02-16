const print = require("@babel/generator").default;

exports.plugin = flowTypeFields;
exports.precheck = src => precheckRE.test(src);

const precheckRE = /\bclass\b/;

function flowTypeFields() {
  function commentFromString(comment) {
    return typeof comment === "string"
      ? { type: "CommentBlock", value: comment }
      : comment;
  }

  function attachComment(ofPath) {
    let comments = generateComment(ofPath);
    let toPath = ofPath.getNextSibling();
    let where = "leading";

    if (!toPath.node) {
      toPath = ofPath.getPrevSibling();
      where = "trailing";
    }
    if (!toPath.node) {
      toPath = ofPath.parentPath;
      where = "inner";
    }
    if (!Array.isArray(comments)) {
      comments = [comments];
    }
    comments = comments.map(commentFromString);
    if (ofPath && ofPath.node) {
      // Removes the node at `ofPath` while conserving the comments attached
      // to it.
      const node = ofPath.node;
      const parent = ofPath.parentPath;
      const prev = ofPath.getPrevSibling();
      const next = ofPath.getNextSibling();
      const isSingleChild = !(prev.node || next.node);
      const leading = node.leadingComments;
      const trailing = node.trailingComments;

      if (isSingleChild && leading) {
        parent.addComments("inner", leading);
      }
      toPath.addComments(where, comments);
      ofPath.remove();
      if (isSingleChild && trailing) {
        parent.addComments("inner", trailing);
      }
    } else {
      toPath.addComments(where, comments);
    }
  }

  function generateComment(path) {
    const comment = (path.getSource() || path.toString())
      .replace(/\*-\//g, "*--/")
      .replace(/\*\//g, "*-/");
    return ":: " + comment;
  }

  return {
    visitor: {
      ClassProperty(path) {
        if (path.node.typeAnnotation && !path.node.value) {
          attachComment(path);
        }
      }
    }
  };
}
