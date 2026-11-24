// Makes the ADMIN_PASSWORD_HASH value for an admin password.
// usage: node scripts/hash-password.mjs "your password"
import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Give a password of at least 10 characters: node scripts/hash-password.mjs "your password"');
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`scrypt:${salt.toString('base64url')}:${scryptSync(password, salt, 64).toString('base64url')}`);
