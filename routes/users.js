const express = require('express');
const router = express.Router();
const security = require('../util/security');

const users = require('../model/users');
const request = require('../model/request');

const hash = require('../util/hash');
const mailinfo = require('../util/mailinfo');
const tool = require('../util/tool');

/**
 * ユーザー登録リクエスト入力画面へ
 */
 router.get('/request', (req, res, next) => {
  res.render('request', {
  });
});

/**
 * パスワード更新リクエスト入力画面へ
 */
 router.get('/requestpwd', (req, res, next) => {
  res.render('requestpwd', {
  });
});

/**
 * リクエストエラー画面へ遷移
 */
router.get('/requesterr', (req, res, next) => {
  res.render('requesterr', {
  });
});

/**
 * リクエスト受付処理
 * kubunが「adduser」でユーザー登録リクエスト
 * kubunが「updpwd」でパスワード更新リクエスト
 */
router.get('/request/:key', (req,res, next) => {

  (async () => {

    const key = req.params.key;

    // 登録リクエスト情報を取得
    const retObjRequest = await request.findByKey(key);

    // 登録リクエスト情報レコードが存在しない場合はエラー画面へ
    if (!retObjRequest) {
      req.flash("error", `不正なリクエストとなります。`);
      res.redirect("/users/requesterr");
    } else {

      // 登録リクエスト情報のレコードの有効期限が切れている場合はエラー画面へ
      if (tool.getYYYYMMDD(new Date()) !== retObjRequest.ymd_limit) {
        req.flash("error", `有効期限が切れています`);
        res.redirect("/users/requesterr");

      } else {

        // 登録されているユーザー情報を取得
        const retObjUser = await users.findByEmail(retObjRequest.email);

        // ユーザー登録リクエストの場合
        if (retObjRequest.kubun === 'adduser') {

          // すでに登録完了している場合はエラー画面へ
          if (retObjUser) {
            req.flash("error", `メールアドレス【${retObjRequest.email}】はすでに登録されています。`);
            res.redirect("/users/requesterr");
          } else {
            res.render('userForm', {
              user: retObjRequest,
              mode: "add",
              key: key,
            });
          }

        // パスワード更新リクエストの場合
        } else {

          // 登録されていない場合はエラー画面へ
          if (!retObjUser) {
            req.flash("error", `メールアドレス【${retObjRequest.email}】は登録されていません。`);
            res.redirect("/users/requesterr");
          } else {
            res.render('userForm', {
              user: retObjUser,
              mode: "updpwd",
              key: key,
            });
          }
        }
      }
    }

  })();
})

/**
 * ユーザー登録リクエスト情報登録処理
 */
router.post('/request', (req, res, next) => {

  (async () => {

    // 対象メールアドレスがすでに登録されていないか確認
    const email = req.body.email;
    const retObj = await users.findByEmail(email);

    // すでに登録されている場合
    if (retObj) {
      req.flash("error", `メールアドレス【${email}】はすでに登録されています。`);
      res.redirect("/users/request");

    } else {

      // ランダムなセッションIDを作成し、URLを作成する
      const randomstring = hash.getRandomString(32);
      const url = `${process.env.URL}/users/request/${randomstring}`

      // メール文を作成
      let body = "プラットフォームサービス株式会社です。\r\n\r\n";
      body += "ユーザーの新規登録がリクエストされました。以下のリンクから登録してください。\r\n\r\n"
      body += `${url}\r\n\r\n`;
      body += "もしリクエストした覚えがない場合は、メールを破棄してください。\r\n"
      body += "リンクの有効期限は6時間です。\r\n\r\n===\r\n\r\n";
      body += "※このメールは送信専用アドレスよりお送りしています。\r\n";
      body += "返信はできませんのでご注意ください。\r\n";
      body += "何かありましたら下記サポートメールアドレスまでご連絡くださいませ。\r\n\r\n-\r\n\r\n";
      body += "プラットフォームサービス株式会社　コンシェルジュ\r\n";
      body += "info@yamori.jp";

      // 送信
     await mailinfo.send(email, "ユーザー登録について【プラットフォームサービス株式会社】",body)

      // データベースへ登録
      let inObj = {};
      inObj.email = email;
      inObj.key = randomstring;
      inObj.kubun = 'adduser';
      inObj.ymd_limit = tool.getYYYYMMDD(new Date());
      await request.insert(inObj);

      // 画面へリダイレクト
      req.flash("success", "入力したメールアドレス宛に新規登録用のメールをお送りしましたので、メールの内容を確認し、ユーザー登録を完了してください。");
      res.redirect('/login');
    }

  })()
});

/**
 * パスワード更新リクエスト情報登録処理
 */
 router.post('/requestpwd', (req, res, next) => {

  (async () => {

    // 対象メールアドレスが登録されているか確認
    const email = req.body.email;
    const retObj = await users.findByEmail(email);

    // 登録されていない場合
    if (!retObj) {
      req.flash("error", `メールアドレス【${email}】は登録されていません。`);
      res.redirect("/users/requestpwd");

    } else {

      // ランダムなセッションIDを作成し、URLを作成する
      const randomstring = hash.getRandomString(32);
      const url = `${process.env.URL}/users/request/${randomstring}`

      // メール文を作成
      let body = `${retObj.name}さん\r\n\r\n`;
      body += "プラットフォームサービス株式会社です。\r\n\r\n";
      body += "パスワードの変更がリクエストされました。以下のリンクから再設定してください。\r\n\r\n"
      body += `${url}\r\n\r\n`;
      body += "もしリクエストした覚えがない場合は、メールを破棄してください。\r\n"
      body += "上記リンクからパスワードの再設定をしないかぎり、パスワードは変更されませんのでご注意ください。\r\n";
      body += "リンクの有効期限は6時間です。\r\n\r\n===\r\n\r\n";
      body += "※このメールは送信専用アドレスよりお送りしています。\r\n";
      body += "返信はできませんのでご注意ください。\r\n";
      body += "何かありましたら下記サポートメールアドレスまでご連絡くださいませ。\r\n\r\n-\r\n\r\n";
      body += "プラットフォームサービス株式会社　コンシェルジュ\r\n";
      body += "info@yamori.jp";

      // 送信
     await mailinfo.send(email, "パスワード再設定について【プラットフォームサービス株式会社】",body)

      // データベースへ登録
      let inObj = {};
      inObj.email = email;
      inObj.key = randomstring;
      inObj.kubun = 'updpwd';
      inObj.ymd_limit = tool.getYYYYMMDD(new Date());
      await request.insert(inObj);

      // 画面へリダイレクト
      req.flash("success", "入力したメールアドレス宛にパスワード更新用のメールをお送りしましたので、メールの内容を確認し、パスワード更新を完了してください。");
      res.redirect('/login');
    }

  })()
});

/**
 * ユーザー情報の登録
 */
router.post('/add', (req, res, next) => {

  if ((!req.body.name) || (!req.body.name_company) || (!req.body.email) || (!req.body.password)) {
    req.flash("error", `名前、会社名、メールアドレス、パスワードはすべて入力してください。`);
    res.redirect(`/users/request/${req.body.key}`);
  } else {
    (async () => {

      const retUserObj = await users.findPKey(req.body.email);

      if (retUserObj) {
        req.flash("error", `メールアドレス【${req.body.email}】はすでに登録されています。別のメールアドレスを入力してください。`);
        res.redirect(`/users/request/${req.body.key}`);
      } else {
        let inObjUser = {};
        inObjUser.id = req.body.id;
        inObjUser.name = req.body.name;
        inObjUser.name_company = req.body.name_company;
        inObjUser.email = req.body.email;
        inObjUser.password = hash.digest(req.body.password);
        inObjUser.ymdhms_add = tool.getYYYYMMDDhhmmss(new Date());
        inObjUser.ymdhms_upd = tool.getYYYYMMDDhhmmss(new Date());
        inObjUser.ymdhms_del = '99991231235959';
        try {
          const retObjUsers = await users.insert(inObjUser);
          req.flash("success", `登録が完了しました。`);
          res.redirect('/login');
  
        } catch (err) {
          // if (err.errno === 1062) {
          if (err.code === '23505') {
            req.flash("error", `メールアドレス【${inObjUser.email}】はすでに登録されています。`);
            res.redirect(`/users/request/${req.body.key}`);
          } else {
            throw err;
          }
        }
      }
    })();
  }
});

/**
 * パスワードの更新
 */
router.post('/updpwd', (req, res, next) => {

  if (!req.body.password) {
    req.flash("error", `パスワードは必ず入力してください。`);
    res.redirect(`/users/request/${req.body.key}`);
  } else {

    (async () => {

      let inObjUser = {};
      inObjUser.id = req.body.id;
      inObjUser.name = req.body.name;
      inObjUser.name_company = req.body.name_company;
      inObjUser.email = req.body.email;
      inObjUser.password = req.body.password? hash.digest(req.body.password): null;
      inObjUser.ymdhms_add = req.body.ymdhms_add;
      inObjUser.ymdhms_upd = tool.getYYYYMMDDhhmmss(new Date());
      inObjUser.ymdhms_del = req.body.ymdhms_del;

      const retObjUser = await users.update(inObjUser);

      if (retObjUser.rowCount === 0) {
        req.flash("error", `ID【${res.body.id}】はすでに削除されています。`);
        res.redirect(`/users/request/${req.body.key}`);
      } else {
        req.flash("success", `パスワードを更新しました。`);
        res.redirect('/login');
      }
    })();
  }
});

/**
 * ユーザー情報を編集する画面へ遷移する（ログイン後）
 */
router.get('/updinfo', security.authorize(), (req,res,next) => {

  (async () => {

    // 現在のユーザー情報を取得
    const retObjUser = await users.findPKey(req.user.id)

    if (retObjUser) {
      res.render('userForm', {
        user: retObjUser,
        mode: "upd",
        key: null,
      });
    } else {
      req.flash("error", `ID【${res.body.id}】はすでに削除されています。`);
      res.redirect("/");
    }
  })();
})

/**
 * ユーザー情報を編集する
 */
router.post("/upd", security.authorize(), (req, res, next) => {

  if ((!req.body.id) || (!req.body.name) || (!req.body.name_company)|| (!req.body.email)) {
    req.flash("error", `名前、会社名、メールアドレスはすべて入力してください。`);
    res.redirect(`/users/upd`);
  } else {

    (async () => {

      let inObjUser = {};
      inObjUser.id = req.body.id;
      inObjUser.name = req.body.name;
      inObjUser.name_company = req.body.name_company;
      inObjUser.password = req.body.password? hash.digest(req.body.password): null;
      inObjUser.ymdhms_add = req.body.ymdhms_add;
      inObjUser.ymdhms_upd = tool.getYYYYMMDDhhmmss(new Date());
      inObjUser.ymdhms_del = req.body.ymdhms_del;

      const retObjUser = await users.update(inObjUser);

      if (retObjUser.rowCount === 0) {
        req.flash("error", `ID【${res.body.id}】はすでに削除されています。`);
        res.redirect("/users/upd");
      } else {
        req.flash("success", "ユーザー情報を更新しました。");
        res.redirect("/");
      }
    })();
  }
});


module.exports = router;
