exports.plugin = removeResolve;
exports.precheck = src => precheckRE.test(src);

const precheckRE = /(?:from|require\s*\()\s*(?<quote>"|')resolve\k<quote>/;

function removeResolve({ types: t }) {
  return {
    visitor: {
      Program(path) {
        for (const el of path.get("body")) {
          if (
            el.isImportDeclaration() &&
            el.get("source").isStringLiteral({ value: "resolve" })
          ) {
            el.remove();
          }
        }
      },
      CallExpression(path) {
        if (!path.get("callee").matchesPattern("resolve.sync")) return;

        const args = [path.get("arguments.0").node];

        if (path.get("arguments").length > 1) {
          // unsupported
          if (!path.get("arguments.1").isObjectExpression()) return;

          const opts = t.objectExpression([]);
          for (const prop of path.get("arguments.1.properties")) {
            // unsupported
            if (!prop.isObjectProperty({ computed: false })) return;

            switch (prop.node.key.name) {
              case "basedir":
                opts.properties.push(
                  t.objectProperty(
                    t.identifier("paths"),
                    t.arrayExpression([prop.node.value])
                  )
                );
                break;

              // unsupported
              default: return;
            }
          }

          args.push(opts);
        }

        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.identifier("require"),
              t.identifier("resolve")
            ),
            args
          )
        );
      }
    }
  };
}
