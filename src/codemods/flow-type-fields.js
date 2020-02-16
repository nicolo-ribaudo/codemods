const print = require("@babel/generator").default;

exports.plugin = flowTypeFields;
exports.precheck = src => precheckRE.test(src);

const precheckRE = /\bclass\b/;

function flowTypeFields(babel, opts) {
  function addComments(node, comments) {
    if (!node.comments) node.comments = [];

    for (const comment of comments) {
      if (!node.comments.includes(comment)) node.comments.push(comment);
    }

    node.comments.sort((a, b) => a.start > b.start ? 1 : -1);
  }

  function attachComment(ofPath) {
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

    const leading = where === "leading";
    const trailing = where === "trailing";

    const comment = {
      type: "CommentBlock",
      value: generateComment(ofPath),
      start: ofPath.node.start,
      end: ofPath.node.end,
      loc: ofPath.node.loc,
      leading,
      trailing,
    };

    const comments = ofPath.node.comments;
    comments.forEach(comment => {
      comment.leading = leading;
      comment.trailing = trailing;
    });
    comments.push(comment);

    addComments(toPath.node, comments);
    ofPath.remove();
  }

  function generateComment(path) {
    let comment = (path.getSource() || path.toString())
      .replace(/\*-\//g, "*--/")
      .replace(/\*\//g, "*-/");
    
    if (comment.includes("\n")) {
      const indent = path.node.loc.start.column;
      if (indent) comment = comment.replace(new RegExp(`^\\s{0,${indent}}`, "gm"), "");
      comment = "\n" + comment + "\n";
    } else {
      comment = " " + comment + " ";
    }

    return "::" + comment;
  }

  return {
    visitor: {
      ClassProperty(path) {
        const { node } = path;
        const classNode = path.parentPath.parent;

        if (node.value) return;

        if (
          opts.all ||
          (opts.derived && classNode.superClass) ||
          (opts.covariant && node.variance && node.variance.kind === "plus")
        ) {
          attachComment(path);
        }
      }
    }
  };
}
