const express = require('express');
const router = express.Router();

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
        const retObjUser = await users.findPKey(retObjRequest.id);

        // ユーザー登録リクエストの場合
        if (retObjRequest.kubun === 'adduser') {

          // すでに登録完了している場合はエラー画面へ
          if (retObjUser) {
            req.flash("error", `メールアドレス【${retObjRequest.id}】はすでに登録されています。`);
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
            req.flash("error", `メールアドレス【${retObjRequest.id}】は登録されていません。`);
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
    const id = req.body.email;
    const retObj = await users.findPKey(id);

    // すでに登録されている場合
    if (retObj) {
      req.flash("error", `メールアドレス【${id}】はすでに登録されています。`);
      res.redirect("/users/request");

    } else {

      // ランダムなセッションIDを作成し、URLを作成する
      const randomstring = hash.getRandomString(32);
      const url = `http://localhost:3000/users/request/${randomstring}`

      // メール文を作成
      const body = `こちらのURLをクリックし、ユーザー登録を完了させてください。\r\n${url}`;

      // 送信
     await mailinfo.send(id, "ユーザー登録用URLの送信",body)

      // データベースへ登録
      let inObj = {};
      inObj.id = id;
      inObj.key = randomstring;
      inObj.kubun = 'adduser';
      inObj.ymd_limit = tool.getYYYYMMDD(new Date());
      await request.insert(inObj);

      // 画面へリダイレクト
      req.flash("success", "入力したメールアドレス宛に登録確認用のメールをお送りしましたので、メールの内容を確認し、ユーザー登録を完了してください。");
      res.redirect("/users/request");
    }

  })()
});

/**
 * パスワード更新リクエスト情報登録処理
 */
 router.post('/requestpwd', (req, res, next) => {

  (async () => {

    // 対象メールアドレスが登録されているか確認
    const id = req.body.email;
    const retObj = await users.findPKey(id);

    // 登録されていない場合
    if (!retObj) {
      req.flash("error", `メールアドレス【${id}】は登録されていません。`);
      res.redirect("/users/requestpwd");

    } else {

      // ランダムなセッションIDを作成し、URLを作成する
      const randomstring = hash.getRandomString(32);
      const url = `http://localhost:3000/users/request/${randomstring}`

      // メール文を作成
      const body = `こちらのURLをクリックし、パスワードを更新してください。\r\n${url}`;

      // 送信
     await mailinfo.send(id, "パスワード更新用URLの送信",body)

      // データベースへ登録
      let inObj = {};
      inObj.id = id;
      inObj.key = randomstring;
      inObj.kubun = 'updpwd';
      inObj.ymd_limit = tool.getYYYYMMDD(new Date());
      await request.insert(inObj);

      // 画面へリダイレクト
      req.flash("success", "入力したメールアドレス宛にパスワード更新確認用のメールをお送りしましたので、メールの内容を確認し、パスワード更新を完了してください。");
      res.redirect("/users/requestpwd");
    }

  })()
});

/**
 * ユーザー情報の登録
 */
router.post('/add', (req, res, next) => {

  if ((!req.body.id) || (!req.body.name) || (!req.body.name_company) || (!req.body.password)) {
    req.flash("error", `ID、名前、会社名、パスワードはすべて入力してください`);
    res.redirect(`/users/request/${req.body.key}`);
  } else {
    (async () => {

      let inObjUser = {};
      inObjUser.id = req.body.id;
      inObjUser.name = req.body.name;
      inObjUser.name_company = req.body.name_company;
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
          req.flash("error", `ユーザー【${inObjUser.id}】はすでに存在しています`);
          res.redirect(`/users/request/${req.body.key}`);
        } else {
          throw err;
        }
      }
    })();
  }
});

/**
 * パスワードの更新
 */
router.post('/updpwd', (req, res, next) => {

  if ((!req.body.id) || (!req.body.name) || (!req.body.name_company)  || (!req.body.password)) {
    req.flash("error", `ID、名前、会社名、パスワードはすべて入力してください。`);
    res.redirect(`/users/request/${req.body.key}`);
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
        res.redirect(`/users/request/${req.body.key}`);
      } else {
        req.flash("success", `パスワードを更新しました。`);
        res.redirect('/login');
      }
    })();
  }
});

module.exports = router;
