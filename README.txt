USAGE:
  npx @nicolo-ribaudo/codemods [codemod name] [...codemod options] [...files]

  !!! After running any codemod, don't forget to review the transformed code !!!

EXAMPLES:
  (1) npx @nicolo-ribaudo/codemods ts-type-fields --readonly src/A.ts src/B.ts

  (2) If your shell supports glob patterns, you can use them to specify multiple
      files:

      npx @nicolo-ribaudo/codemods remove-resolve src/**/*.js

SUPPORTED CODEMODS:
  remove-resolve    Replaces the "resolve" library with calls to the Node.js
                    method "require.resolve".
                    It supports the "basedir" parameter.

  flow-type-fields  Wraps type-only class fields in flow comments (/*: ... */).
                    Starting from Babel 8.0.0, unwrapped fields will be
                    initialized to "undefined" by default.
                    This codemod accepts the following options, to filer the
                    uninitialized fields to transform:
                     --all       All the uninitialized fields
                     --derived   In derived classes
                     --covariant Covariant (+) fields
