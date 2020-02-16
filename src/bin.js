#!/usr/bin/env node

const fs = require("fs");
const { codemod } = require("./utils");

const [/* node */, /* script */, codemodName, ...optsOrFiles] = process.argv;

const opts = {};
const files = [];

if (
  codemodName === "--help" ||
  codemodName === "-h" ||
  !codemodName
) {
  console.log(fs.readFileSync(__dirname + "/../README.txt", "utf8"));
  return;
}

optsOrFiles.forEach(name => {
  if (name.startsWith("--")) {
    opts[name.slice(2)] = true;
  } else {
    files.push(name);
  }
});

let plugin, precheck;
try {
  ({ plugin, precheck } = require(`./codemods/${codemodName}`));
} catch {
  throw new Error(
    `Cannot find the "${codemodName}" codemod.\n` +
    `For a list of supported codemods, run\n` +
    `  npx @nicolo-ribaudo/codemods --help\n`
  );
}

if (files.length === 0) {
  throw new Error(`No filename specified.`);
}

Promise.allSettled(
  files.map(filename =>
    codemod(filename, precheck, [plugin, opts]).then(
      () => process.stdout.write("."),
      e => console.log("x", filename, e)
    )
  )
).finally(() => process.stdout.write("\n"));
