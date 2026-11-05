import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const PARAMETERS = { N: 32_768, r: 8, p: 3 };
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, { ...PARAMETERS, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${PARAMETERS.N}$${PARAMETERS.r}$${PARAMETERS.p}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password, encodedHash) {
  const [algorithm, cost, blockSize, parallelization, saltHex, keyHex] = encodedHash.split('$');
  if (algorithm !== 'scrypt' || !cost || !blockSize || !parallelization || !saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  if (expected.length !== KEY_LENGTH) return false;

  const parameters = { N: Number(cost), r: Number(blockSize), p: Number(parallelization) };
  if (!Number.isInteger(parameters.N) || parameters.N < 2 || parameters.N > 131_072
    || !Number.isInteger(parameters.r) || parameters.r < 1 || parameters.r > 16
    || !Number.isInteger(parameters.p) || parameters.p < 1 || parameters.p > 4) return false;

  try {
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length, {
      ...parameters,
      maxmem: 64 * 1024 * 1024,
    });
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
