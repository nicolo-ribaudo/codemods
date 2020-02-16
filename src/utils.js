const recast = require("recast");
const babel = require("@babel/core");
const pfs = require("fs").promises;
const path = require("path");

const TRALING_NL_RE = /(?:\n|\r|\r\n)+$/;

exports.codemod = codemod;
exports.babelRecast = babelRecast;

async function codemod(relativeFilename, precheck, plugin) {
  const filename = path.resolve(process.cwd(), relativeFilename);
  const input = await pfs.readFile(filename, "utf8");
  if (!precheck(input)) return;

  let output = await babelRecast(
    input,
    {
      filename,
      cwd: path.dirname(filename),
      rootMode: "upward-optional",
      parserOpts: { tokens: true }
    },
    { plugins: [plugin], configFile: false }
  );
  const nl = input.match(TRALING_NL_RE);
  if (nl) output += nl[0];

  return pfs.writeFile(filename, output);
}

async function babelRecast(code, parserOpts, transformerOpts) {
  const ast = recast.parse(code, {
    parser: {
      parse: source => adjustComments(babel.parseSync(source, parserOpts))
    }
  });

  const opts = Object.assign(
    {
      ast: true,
      code: false
    },
    transformerOpts,
    {
      plugins: [
        // For some reason, recast doesn't work with transformFromAst.
        // Use this hack instead.
        [setAst, { ast, code }]
      ].concat(transformerOpts.plugins || [])
    }
  );

  const output = await babel.transformAsync("", opts);

  return recast.print(output.ast).code;
}

function setAst(babel, { ast, code }) {
  return {
    pre(file) {
      file.code = code;
      file.path.get("program").replaceWith(ast.program);
      file.ast.program = ast.program;
    },
  };
}

function adjustComments(node) {
  const seen = new WeakSet();

  const copy = (from, to, leading, trailing) => {
    from.forEach(comment => {
      if (!seen.has(comment)) {
        comment.leading = leading;
        comment.trailing = trailing;
        to.push(comment);
        seen.add(comment);
      }
    })
  }

  babel.types.traverseFast(node, (node) => {
    const comments = [];
    if (node.leadingComments) {
      copy(node.leadingComments, comments, true, false);
      delete node.leadingComments;
    }
    if (node.innerComments) {
      copy(node.innerComments, comments, false, false);
      delete node.innerComments;
    }
    node.comments = comments;
  });

  babel.types.traverseFast(node, (node) => {
    if (node.trailingComments) {
      copy(node.trailingComments, node.comments, false, true);
      delete node.trailingComments;
    }
  })

  return node;
}
