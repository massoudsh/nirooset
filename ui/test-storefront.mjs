import { createRequire } from 'node:module'
import { mkdtemp, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { build } = require('esbuild')
const root = fileURLToPath(new URL('.', import.meta.url))
const temporary = await mkdtemp(join(root, '.storefront-test-'))
try {
  const outfile = join(temporary, 'tests.mjs')
  await build({
    absWorkingDir: root,
    entryPoints: ['src/components/storefront.test.jsx'],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    packages: 'external',
    nodePaths: require.resolve.paths('react'),
    plugins: [{
      name: 'wallet-fixture',
      setup(build) {
        build.onResolve({ filter: /context\/Web3Context$/ }, () => ({ path: 'wallet', namespace: 'fixture' }))
        build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useWeb3 = () => globalThis.storefrontWallet' }))
      },
    }],
  })
  await import(pathToFileURL(outfile).href)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
