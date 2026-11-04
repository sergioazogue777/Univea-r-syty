const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('./passwords');

test('password is stored as an adaptive salted hash', async () => {
  const one = await hashPassword('clave-larga-123');
  const two = await hashPassword('clave-larga-123');
  assert.notEqual(one, two);
  assert.equal(one.startsWith('scrypt$'), true);
  assert.deepEqual(await verifyPassword('clave-larga-123', one), { valid: true, legacy: false });
  assert.equal((await verifyPassword('incorrecta', one)).valid, false);
});
test('legacy passwords are accepted only to allow migration', async () => {
  assert.deepEqual(await verifyPassword('antigua', 'antigua'), { valid: true, legacy: true });
  assert.equal((await verifyPassword('otra', 'antigua')).valid, false);
});
test('malformed stored password is rejected', async () => {
  assert.equal((await verifyPassword('clave', 'scrypt$nothex$broken')).valid, false);
});
