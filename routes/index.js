const express = require('express');
const router = express.Router();
const security = require('../util/security');
const users = require('../model/users');

/**
 * トップページの表示
 */
router.get('/', security.authorize(), (req, res, next)=> {
  (async () => {
    const retObjUser = await users.findPKey(req.user.id);
    res.render("index", {
      user: retObjUser,
    });
  })();
});

/**
 * ログインページの表示
 */
router.get('/login', (req, res) => {
  res.render("./login.ejs", { message: req.flash("message") });
});

/**
 * ログイン処理
 */
router.post('/login', security.authenticate());

/**
 * ログアウト処理
 */
router.post("/logout", (req, res) => {
  req.logout( () => {
    res.redirect("/login");
  });
});

module.exports = router;
