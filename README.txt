USAGE:
  npx @nicolo-ribaudo/codemods [codemod name] [...files]

  !!! After running any codemod, don't forget to review the transformed code !!!

EXAMPLES:
  (1) npx @nicolo-ribaudo/codemods ts-type-fields src/Class1.ts src/Class2.ts

  (2) If your shell supports glob patterns, you can use them to specify multiple
      files:

      npx @nicolo-ribaudo/codemods remove-resolve src/**/*.js

SUPPORTED CODEMODS:
  remove-resolve    Replaces the "resolve" library with calls to the Node.js
                    method "require.resolve".
                    It supports the "basedir" parameter.

  ts-type-fields    Adds the "declare" keyword before type-only class fields
                    declarations in TypeScript. Starting from Babel 8.0.0,
                    fields without the "declare" keyword will be initialized to
                    "undefined" by default.

  flow-type-fields  Wraps type-only class fields in flow comments (/*: ... */).
                    Starting from Babel 8.0.0, unwrapped fields will be
                    initialized to "undefined" by default.
