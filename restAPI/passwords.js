const { scrypt, randomBytes, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const deriveKey = promisify(scrypt);
const KEY_LENGTH = 64;
const PREFIX = 'scrypt';

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new TypeError('Password must be a nonempty string');
  }
  const salt = randomBytes(16).toString('hex');
  const derived = await deriveKey(password, salt, KEY_LENGTH);
  return [PREFIX, salt, derived.toString('hex')].join('$');
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return { valid: false, legacy: false };
  const parts = stored.split('$');
  if (parts.length === 3 && parts[0] === PREFIX) {
    if (!/^[a-f0-9]{32}$/i.test(parts[1]) || !/^[a-f0-9]{128}$/i.test(parts[2])) {
      return { valid: false, legacy: false };
    }
    const candidate = await deriveKey(password, parts[1], KEY_LENGTH);
    const expected = Buffer.from(parts[2], 'hex');
    return { valid: timingSafeEqual(candidate, expected), legacy: false };
  }
  // Compatibility with existing academic data: automatically upgrade on successful login.
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  return { valid: a.length === b.length && timingSafeEqual(a, b), legacy: true };
}
module.exports = { hashPassword, verifyPassword };
