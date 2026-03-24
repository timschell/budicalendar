import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import svelte from "rollup-plugin-svelte"
import { terser } from "rollup-plugin-terser"
import postcss from "rollup-plugin-postcss"
import json from "rollup-plugin-json"
import copy from "rollup-plugin-copy2"
import tar from "tar"
import fs from "fs"
import crypto from "crypto"

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const ignoredWarnings = [
  "unused-export-let",
  "css-unused-selector",
  "module-script-reactive-declaration",
  "a11y-no-onchange",
]

const clean = () => ({
  buildStart() {
    const dist = "./dist/"
    if (fs.existsSync(dist)) {
      fs.readdirSync(dist).forEach(p => {
        if (p.endsWith(".tar.gz")) fs.unlinkSync(dist + p)
      })
    }
  },
})

const hash = () => ({
  writeBundle() {
    const fileBuffer = fs.readFileSync("dist/plugin.min.js")
    const hashSum = crypto.createHash("sha1")
    hashSum.update(fileBuffer)
    const hex = hashSum.digest("hex")
    const schema = JSON.parse(fs.readFileSync("./dist/schema.json", "utf8"))
    fs.writeFileSync("./dist/schema.json", JSON.stringify({
      ...schema,
      hash: hex,
      version: pkg.version,
    }, null, 2))
  },
})

const bundle = () => ({
  async writeBundle() {
    const bundleName = `${pkg.name}-${pkg.version}.tar.gz`
    return tar
      .c({ gzip: true, cwd: "dist" }, ["plugin.min.js", "schema.json", "package.json"])
      .pipe(fs.createWriteStream(`dist/${bundleName}`))
  },
})

// Budibase 3.24 Svelte-Kompatibilitäts-Bridge
const compatBanner = `var __bbfc_svelte=(typeof svelteLegacy!=="undefined"?svelteLegacy:svelte);var __bbfc_si=(typeof svelteLegacyInternal!=="undefined"?svelteLegacyInternal:svelte_internal);`

export default {
  input: "index.js",
  external: ["svelte", "svelte/internal"],
  output: {
    sourcemap: false,
    format: "iife",
    file: "dist/plugin.min.js",
    name: "plugin",
    banner: compatBanner,
    globals: {
      "svelte": "__bbfc_svelte",
      "svelte/internal": "__bbfc_si",
    },
  },
  plugins: [
    clean(),
    svelte({
      emitCss: true,
      onwarn: (warning, handler) => {
        if (!ignoredWarnings.includes(warning.code)) handler(warning)
      },
    }),
    postcss(),
    commonjs(),
    resolve({
      preferBuiltins: true,
      browser: true,
      skip: ["svelte", "svelte/internal"],
      dedupe: ["svelte"],
    }),
    json(),
    terser({ format: { comments: false } }),
    copy.default({ assets: ["schema.json", "package.json"] }),
    hash(),
    bundle(),
  ],
}
