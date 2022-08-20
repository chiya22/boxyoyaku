const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const nodemailer = require('nodemailer');

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/**
 * メール送信
 * @param {*} mail_to 宛先
 * @param {*} title タイトル
 * @param {*} content 本文
 */
const send = (mail_to,title, content) => {

  // 認証情報
  const auth = {
      type         : 'OAuth2',
      user         : process.env.MAIL_USER,
      clientId     : process.env.CLIENT_ID,
      clientSecret : process.env.CLIENT_SECRET,
      refreshToken : process.env.REFRESH_TOKEN
  };

  // トランスポート
  const smtp_config = {
      service : 'gmail',
      auth    : auth
  };    

  let transporter = nodemailer.createTransport(smtp_config);

  // メール情報
  let message = {
      from: process.env.MAIL_FROM,
      // テスト用として宛先を強制的に変更
      // to: 'yoshida@yamori.jp',
      to: mail_to,
      // テスト用として件名に【テスト】を追加
      // subject: `【吉田テスト】${title}`,
      subject: title,
      text: content,
  };

  // メール送信
  transporter.sendMail(message, (err, response) => {
      if (err) {
        logger.info(`[err: ${mail_to}]${err}`);
      } else {
        logger.info(`send mail to ${mail_to}`);
      }
  });
};


module.exports = {
  send,
};
