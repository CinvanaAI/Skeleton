import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = here;
const distRoot = path.join(appRoot, "dist");
const assetsRoot = path.join(distRoot, "assets");
const entryFile = path.join(appRoot, "src", "main.tsx");
const stylesFile = path.join(appRoot, "src", "styles.css");

/**
 * Use a web path here, not path.join(), so Windows does not emit backslashes
 * into the generated HTML script tag.
 */
const bundleFile = "assets/app.js";

function cssStubPlugin() {
  return {
    name: "css-stub",
    load(id) {
      if (!id.endsWith(".css")) {
        return null;
      }
      return "export default undefined;";
    }
  };
}

function transpileTypeScriptPlugin() {
  return {
    name: "transpile-typescript",
    transform(code, id) {
      if (!id.endsWith(".ts") && !id.endsWith(".tsx")) {
        return null;
      }

      const output = ts.transpileModule(code, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          sourceMap: true
        },
        fileName: id
      });

      return {
        code: output.outputText,
        map: output.sourceMapText ? JSON.parse(output.sourceMapText) : null
      };
    }
  };
}

/**
 * Browser-safe replacement for React/commonjs output that still references
 * process.env.NODE_ENV. The shell runs in the browser, so "process" does not
 * exist there.
 */
function browserEnvPlugin() {
  const pattern = /\bprocess\.env\.NODE_ENV\b/g;

  return {
    name: "browser-env",
    transform(code, id) {
      if (!/\.(mjs|js|ts|tsx)$/.test(id)) {
        return null;
      }

      if (!pattern.test(code)) {
        return null;
      }

      pattern.lastIndex = 0;

      return {
        code: code.replace(pattern, JSON.stringify("production")),
        map: null
      };
    },
    renderChunk(code) {
      if (!pattern.test(code)) {
        return null;
      }

      pattern.lastIndex = 0;

      return {
        code: code.replace(pattern, JSON.stringify("production")),
        map: null
      };
    }
  };
}

await rm(distRoot, { recursive: true, force: true });
await mkdir(assetsRoot, { recursive: true });

const bundle = await rollup({
  input: entryFile,
  plugins: [
    nodeResolve({
      browser: true,
      extensions: [".mjs", ".js", ".json", ".ts", ".tsx"]
    }),
    commonjs(),
    cssStubPlugin(),
    transpileTypeScriptPlugin(),
    browserEnvPlugin()
  ]
});

await bundle.write({
  dir: distRoot,
  format: "es",
  sourcemap: true,
  entryFileNames: bundleFile,
  chunkFileNames: "assets/[name]-[hash].js",
  assetFileNames: "assets/[name]-[hash][extname]"
});

await bundle.close();
await copyFile(stylesFile, path.join(distRoot, "styles.css"));
await writeFile(
  path.join(distRoot, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skeleton Rebuild</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./${bundleFile}"></script>
  </body>
</html>
`,
  "utf8"
);