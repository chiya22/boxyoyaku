const crypto = require("crypto");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PASSWORD_SALT = process.env.HASH_SALT;
const PASSWORD_STRECH = process.env.HASH_STRECH;

/**
 * 文字列をハッシュ化する
 * @param {*} text 対象文字列
 * @returns ハッシュ化した文字列
 */
const digest = (text) => {
  let hash;
  text += PASSWORD_SALT;

  for (let i = PASSWORD_STRECH; i--;) {
    hash = crypto.createHash("sha512");
    hash.update(text);
    text = hash.digest("hex");
  }
  return text;
};

/**
 * ランダムな文字列を生成
 * @param {} num 桁数
 * @returns ランダムな文字列
 */
const getRandomString = (num) => {
  const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from(crypto.randomFillSync(new Uint8Array(num))).map((n)=>S[n%S.length]).join('')
}

module.exports = {
  digest,
  getRandomString,
};