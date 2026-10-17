import { createHash, randomBytes } from 'crypto';

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export function newApiKey() {
  return randomBytes(16).toString('hex');
}

export function hashKey(key) {
  return createHash('sha256').update(String(key)).digest('hex');
}
