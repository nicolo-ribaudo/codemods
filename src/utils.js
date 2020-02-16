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
    { filename, cwd: path.dirname(filename), rootMode: "upward-optional" },
    { plugins: [plugin] }
  );

  const nl = input.match(TRALING_NL_RE);
  if (nl) output += nl[0];

  return pfs.writeFile(filename, output);
}

async function babelRecast(code, parserOpts, transformerOpts) {
  const ast = recast.parse(code, {
    parser: {
      parse: source => babel.parseSync(source, parserOpts)
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
        [setAst, { ast }]
      ].concat(transformerOpts.plugins || [])
    }
  );

  const output = await babel.transformAsync("", opts);

  return recast.print(output.ast).code;
}

function setAst(babel, { ast }) {
  return {
    pre(file) {
      file.path.get("program").replaceWith(ast.program);
      file.ast.program = ast.program;
    }
  };
}
