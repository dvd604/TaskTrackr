/**
 * @file Provides an easy to user encrypt and decrypt method
 * Keys are randomly generated on server start, so this should not be used for saving persistent data:
 * Useful for saving data such as temporary tokens that are disposable.
 * */
// encryption.js
const crypto = require('crypto');

const secret_key = crypto.randomBytes(64).toString('hex');
const secret_iv =  crypto.randomBytes(64).toString('hex');
const encryption_method = 'aes-256-cbc';

// Generate secret hash with crypto to use for encryption
const key = crypto
    .createHash('sha512')
    .update(secret_key)
    .digest('hex')
    .substring(0, 32)
const encryptionIV = crypto
    .createHash('sha512')
    .update(secret_iv)
    .digest('hex')
    .substring(0, 16)


/**
 * Utility function to encrypt data with AES-256 encryption - the keys are generated on server startup.
 * @param data - The data to encrypt
 * @returns {string} Encrypted data
 */
function encryptData(data) {
    const cipher = crypto.createCipheriv(encryption_method, key, encryptionIV)
    return Buffer.from(
        cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64') // Encrypts data and converts to hex and base64
}

/**
 * Utility function to decrypt data with AES-256 encryption - the keys are generated on server startup.
 * @param encryptedData - The data to decrypt
 * @returns {string} Plain text data
 */
function decryptData(encryptedData) {
    const buff = Buffer.from(encryptedData, 'base64')
    const decipher = crypto.createDecipheriv(encryption_method, key, encryptionIV)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    ) // Decrypts data and converts to utf8
}

module.exports={encryptData : encryptData, decryptData :decryptData};

//modified from https://dev.to/jobizil/encrypt-and-decrypt-data-in-nodejs-using-aes-256-cbc-2l6d
