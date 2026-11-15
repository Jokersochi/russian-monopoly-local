import { readFileSync, writeFileSync } from 'node:fs';
const file = new URL('../package.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));
data.engines = { ...(data.engines || {}), node: '>=24 <27' };
data.scripts = {
  ...data.scripts,
  'build:online': 'esbuild server/index.ts --bundle --platform=node --format=esm --target=node24 --packages=external --outfile=dist-server/index.mjs',
  'dev:online': 'npm run build:online && node dist-server/index.mjs',
  'typecheck': 'tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.server.json --noEmit',
  'verify:all': 'npm run typecheck && npm run lint && npm run test && npm run build && npm run build:online',
};
writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
