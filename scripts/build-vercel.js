import { spawnSync } from 'node:child_process';

// One Vercel project serves the site and /api. Override the local .env URL
// so a production bundle can never point at localhost.
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_API_URL: '' },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
