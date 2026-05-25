/**
 * Wallet Service — Generate and manage Solana wallets
 * Non-custodial: private keys encrypted at rest
 */

const { Keypair } = require('@solana/web3.js');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 16) {
  console.warn('⚠️ ENCRYPTION_KEY not set or too short. Wallet encryption disabled.');
}

const ALGORITHM = 'aes-256-gcm';

/**
 * Generate a new Solana wallet keypair
 */
function generateWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Buffer.from(keypair.secretKey).toString('base64'),
    keypair,
  };
}

/**
 * Encrypt a private key
 */
function encryptPrivateKey(privateKeyBase64) {
  if (!ENCRYPTION_KEY) return privateKeyBase64; // fallback

  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(privateKeyBase64, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a private key
 */
function decryptPrivateKey(encryptedData) {
  if (!ENCRYPTION_KEY || !encryptedData.includes(':')) return encryptedData; // fallback

  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Restore a Keypair from encrypted private key
 */
function restoreKeypair(encryptedPrivateKey) {
  const privateKeyBase64 = decryptPrivateKey(encryptedPrivateKey);
  const secretKey = Buffer.from(privateKeyBase64, 'base64');
  return Keypair.fromSecretKey(secretKey);
}

module.exports = {
  generateWallet,
  encryptPrivateKey,
  decryptPrivateKey,
  restoreKeypair,
};
