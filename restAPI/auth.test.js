const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { verifyToken, middleware } = require('./auth');

test('valid JWT resolves the user ID', () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-secret-not-for-production';
  try {
    const token = jwt.sign({ foo: 'test-user' }, process.env.JWT_SECRET, { algorithm: 'HS256' });
    assert.equal(verifyToken(token).foo, 'test-user');
    assert.equal(verifyToken('Bearer ' + token).foo, 'test-user');
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});

test('invalid or expired JWT is rejected', () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-secret-not-for-production';
  try {
    assert.throws(() => verifyToken('not-a-token'), /Token inválido/);
    const expired = jwt.sign({ foo: 'test' }, process.env.JWT_SECRET, { expiresIn: -1 });
    assert.throws(() => verifyToken(expired), /Token inválido/);
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});

test('middleware rejects missing tokens with 401', () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-secret-not-for-production';
  try {
    let status, body;
    const res = {
      status(code) { status = code; return this; },
      json(value) { body = value; return this; }
    };
    middleware({ headers: {} }, res, () => assert.fail('should not call next'));
    assert.equal(status, 401);
    assert.equal(body.status, 'error');
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});
