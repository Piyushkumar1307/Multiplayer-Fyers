import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDist = path.join(root, 'client', 'dist');
const adminDist = path.join(root, 'admin', 'dist');
const adminTarget = path.join(clientDist, 'admin');

if (!fs.existsSync(clientDist)) {
  console.error('Missing client/dist — run client build first.');
  process.exit(1);
}
if (!fs.existsSync(adminDist)) {
  console.error('Missing admin/dist — run admin build first.');
  process.exit(1);
}

fs.rmSync(adminTarget, { recursive: true, force: true });
fs.cpSync(adminDist, adminTarget, { recursive: true });

console.log('Merged admin → client/dist/admin');
