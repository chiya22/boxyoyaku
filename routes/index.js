const express = require('express');
const router = express.Router();
const security = require('../util/security');
const users = require('../model/users');
const boxs = require('../model/boxs');
const boxyoyakus = require('../model/boxyoyakus');
const tool = require('../util/tool');

/**
 * トップページの表示
 */
router.get('/', security.authorize(), (req, res, next)=> {
  (async () => {

    // 現在のユーザー情報を取得
    const retObjUser = await users.findPKey(req.user.id);

    // 現在のユーザーの予約済情報を取得する
    const retObjBoxyoyaku = await boxyoyakus.findYoyakuByUser(req.user.id);

    // ボックス情報全量を取得する
    const retObjBoxs = await boxs.find();

    let retObjBoxyoyakus;
    let retObjTimeBoxyoyakus;
    let retObjBox;
    let retYYYYMMDD;

    if (retObjBoxyoyaku) {

      // 予約済情報の日付と部屋番号より予約情報を取得する
      retObjBoxyoyakus = await boxyoyakus.findYoyakusByYmdAndRoom(retObjBoxyoyaku.ymd_yoyaku, retObjBoxyoyaku.id_room);

      // 予約された日付より時間リストを作成する
      retObjTimeBoxyoyakus = gettimelist(retObjBoxyoyakus);

      // ボックス情報
      retObjBox = await boxs.findPKey(retObjBoxyoyaku.id_room);

      // 表示日付に予約日付を設定
      retYYYYMMDD = retObjBoxyoyaku.ymd_yoyaku;

    } else {


      // 現在の日付と部屋番号(b01)より予約情報を取得する
      retObjBoxyoyakus = await boxyoyakus.findYoyakusByYmdAndRoom(tool.getYYYYMMDD(new Date()), 'b01');

      // 予約された日付より時間リストを作成する
      retObjTimeBoxyoyakus = gettimelist(retObjBoxyoyakus);

      // ボックス情報
      retObjBox = await boxs.findPKey("b01");
      
      // 表示日付に現在の日付を設定
      retYYYYMMDD = tool.getYYYYMMDD(new Date());

    }

    res.render("index", {
      date: retYYYYMMDD,
      datebefore: tool.getYYYYMMDDBefore(retYYYYMMDD),
      dateafter: tool.getYYYYMMDDAfter(retYYYYMMDD),
      user: retObjUser,
      box: retObjBox,
      boxs: retObjBoxs,
      boxyoyakued: retObjBoxyoyaku,
      boxyoyakus: retObjTimeBoxyoyakus,
    });

  })();
});


/**
 * 日付または部屋番号を変更した場合、対象の予約情報を取得し表示する
 * ※パラメータは「yyyymmdd_idroom」形式とする　例：20220808_b01
 */
router.get('/change/:key', security.authorize(), (req, res, next)=> {
  (async () => {

    const key = req.params.key;
    const targetYYYYMMDD = key.split("_")[0];
    const targetIdRoom = key.split("_")[1];

    // ボックス情報全量を取得する
    const retObjBoxs = await boxs.find();

    // 現在のユーザー情報を取得
    const retObjUser = await users.findPKey(req.user.id);

    // 現在のユーザーの予約済情報を取得する
    const retObjBoxyoyaku = await boxyoyakus.findYoyakuByUser(req.user.id);

    // 予約済情報の日付と部屋番号より予約情報を取得する
    const retObjBoxyoyakus = await boxyoyakus.findYoyakusByYmdAndRoom(targetYYYYMMDD, targetIdRoom);

    // 予約された日付より時間リストを作成する
    const retObjTimeBoxyoyakus = gettimelist(retObjBoxyoyakus);

    // ボックス情報
    const retObjBox = await boxs.findPKey(targetIdRoom);

    res.render("index", {
      date: targetYYYYMMDD,
      datebefore: tool.getYYYYMMDDBefore(targetYYYYMMDD),
      dateafter: tool.getYYYYMMDDAfter(targetYYYYMMDD),
      user: retObjUser,
      box: retObjBox,
      boxs: retObjBoxs,
      boxyoyakued: retObjBoxyoyaku,
      boxyoyakus: retObjTimeBoxyoyakus,
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

/**
 * 30分単位で0時から23時30分までのオブジェクトを作成する
 * @param {*} objBoxYoyakus BOX予約情報
 * @returns 30分単位の時間オブジェクト
 */
const gettimelist = (objBoxYoyakus) => {

  let times = {};
  let index = '';

  // 30分単位の時間オブジェクトを作成（初期化）
  for (let i=0; i<24; i++) {
    index = ("0" + String(i) + "00").slice(-4);
    times[index] = "";
    index = ("0" + String(i) + "30").slice(-4);
    times[index] = "";
  }

  // BOX予約情報が存在する場合、30分単位の時間オブジェクトに予約情報を設定する
  if (objBoxYoyakus.length !== 0) {

    for (let k = 0; k < objBoxYoyakus.length; k++) {

      // 開始時間、終了時間を分に変換する
      const starttime = tool.getMByHhmm(objBoxYoyakus[k].time_start);
      const endtime = tool.getMByHhmm(objBoxYoyakus[k].time_end);

      // 予約情報を時間オブジェクトに設定する
      for (let j = starttime; j < endtime; j+=30) {
        index = tool.getHhmmByM(j);
        times[index] = objBoxYoyakus[k];
      }
    }
  }
  return times;
}



module.exports = router;
