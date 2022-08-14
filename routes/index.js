const express = require('express');
const router = express.Router();
const security = require('../util/security');
const users = require('../model/users');
const rooms = require('../model/rooms');
const yoyakus = require('../model/yoyakus');
const tool = require('../util/tool');

/**
 * トップページの表示
 */
router.get('/', security.authorize(), (req, res, next)=> {
  (async () => {

    // 現在のユーザー情報を取得
    const retObjUser = await users.findPKey(req.user.id);

    // 現在のユーザーの予約済情報を取得する
    const retObjYoyaku = await yoyakus.findYoyakuByUser(req.user.id);

    // 部屋情報全量を取得する
    const retObjRooms = await rooms.find();

    let retObjYoyakus;
    let retObjTimeYoyakus;
    let retObjRoom;
    let retYYYYMMDD;

    if (retObjYoyaku) {

      // 予約済情報の日付と部屋番号より予約情報を取得する
      retObjYoyakus = await yoyakus.findYoyakusByYmdAndRoom(retObjYoyaku.ymd_yoyaku, retObjYoyaku.id_room);

      // 予約された日付より時間リストを作成する
      retObjTimeYoyakus = gettimelist(retObjYoyakus);

      // 部屋情報
      retObjRoom = await rooms.findPKey(retObjYoyaku.id_room);

      // 表示日付に予約日付を設定
      retYYYYMMDD = retObjYoyaku.ymd_yoyaku;

    } else {


      // 現在の日付と部屋番号(b01)より予約情報を取得する
      retObjYoyakus = await yoyakus.findYoyakusByYmdAndRoom(tool.getYYYYMMDD(new Date()), 'b01');

      // 予約された日付より時間リストを作成する
      retObjTimeYoyakus = gettimelist(retObjYoyakus);

      // ボックス情報
      retObjRoom = await rooms.findPKey("b01");
      
      // 表示日付に現在の日付を設定
      retYYYYMMDD = tool.getYYYYMMDD(new Date());

    }

    res.render("index", {
      date: retYYYYMMDD,
      datebefore: tool.getYYYYMMDDBefore(retYYYYMMDD),
      dateafter: tool.getYYYYMMDDAfter(retYYYYMMDD),
      user: retObjUser,
      room: retObjRoom,
      rooms: retObjRooms,
      yoyakued: retObjYoyaku,
      yoyakus: retObjTimeYoyakus,
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

    // 部屋情報全量を取得する
    const retObjRooms = await rooms.find();

    // 現在のユーザー情報を取得
    const retObjUser = await users.findPKey(req.user.id);

    // 現在のユーザーの予約済情報を取得する
    const retObjYoyaku = await yoyakus.findYoyakuByUser(req.user.id);

    // 予約済情報の日付と部屋番号より予約情報を取得する
    const retObjYoyakus = await yoyakus.findYoyakusByYmdAndRoom(targetYYYYMMDD, targetIdRoom);

    // 予約された日付より時間リストを作成する
    const retObjTimeYoyakus = gettimelist(retObjYoyakus);

    // ボックス情報
    const retObjRoom = await rooms.findPKey(targetIdRoom);

    res.render("index", {
      date: targetYYYYMMDD,
      datebefore: tool.getYYYYMMDDBefore(targetYYYYMMDD),
      dateafter: tool.getYYYYMMDDAfter(targetYYYYMMDD),
      user: retObjUser,
      room: retObjRoom,
      rooms: retObjRooms,
      yoyakued: retObjYoyaku,
      yoyakus: retObjTimeYoyakus,
    });

  })();
});

/**
 * 予約情報を登録する
 */
router.post("/addyoyaku", security.authorize(), (req, res, next) => {

  (async () => {
    // 予約済み情報がないか確認
    const retObjYoyakuzumi = await yoyakus.findYoyakuByUser(req.user.id);
    const retObjYoyakucheck = await yoyakus.findYoyakuByDuplicate(req.body.select_ymd_yoyaku,req.body.select_id_room,req.body.select_time_start,req.body.select_time_end,)
    const timeinterval = tool.getMByHhmm(req.body.select_time_end) - tool.getMByHhmm(req.body.select_time_start);
    // 予約は1人1回まで
    if (retObjYoyakuzumi) {
      req.flash("error", "すでに1件予約されています。\r\nすでに登録している予約をキャンセルした後、再度予約を行ってください。");
      res.redirect("/");
    // 他のユーザーが同じ日付、部屋、時間帯で登録している場合
    } else if (retObjYoyakucheck.rowCount !== 0) {
      req.flash("error", "すでに他のユーザーが予約しているため予約できません。\r\n予約条件を見直し、再度予約を行ってください。");
      res.redirect("/");
    // 1回の予約は3時間まで
    } else if (timeinterval > 180) {
      req.flash("error", "1回の予約は3時間までとなります。\r\n予約条件を見直し、再度予約を行ってください。");
      res.redirect("/");
    } else {
      // 予約登録
      const inObj = {};
      inObj.id_user = req.user.id;
      inObj.ymd_yoyaku = req.body.select_ymd_yoyaku;
      inObj.id_room = req.body.select_id_room;
      inObj.time_start = req.body.select_time_start;
      inObj.time_end = req.body.select_time_end;
      inObj.ymdhms_add = tool.getYYYYMMDDhhmmss(new Date());
      inObj.ymdhms_del = '99991231235959';
      const retObjYoyaku = await yoyakus.insert(inObj);
      req.flash("success","予約しました。");
      res.redirect("/");
    }
  })();
});

/**
 * 予約済情報をキャンセル（削除）する
 */
router.post("/cancelyoyaku", security.authorize(), (req, res, next) => {

  (async () => {

    // 予約済み情報を取得
    const retObjYoyakuzumi = await yoyakus.findYoyakuByUser(req.user.id);
    if (retObjYoyakuzumi) {
      const retObjYoyaku = await yoyakus.remove(req.user.id,req.body.ymdhms_add);
      req.flash("success","キャンセルしました。");
      res.redirect("/");
    } else {
      req.flash("error", "すでにキャンセルされています。");
      res.redirect("/");
    }
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
 * @param {*} objYoyakus 予約情報
 * @returns 30分単位の時間オブジェクト
 */
const gettimelist = (objYoyakus) => {

  let times = {};
  let index = '';

  // 30分単位の時間オブジェクトを作成（初期化）
  for (let i=6; i<24; i++) {
    index = ("0" + String(i) + "00").slice(-4);
    times[index] = "";
    index = ("0" + String(i) + "30").slice(-4);
    times[index] = "";
  }

  // 予約情報が存在する場合、30分単位の時間オブジェクトに予約情報を設定する
  if (objYoyakus.length !== 0) {

    for (let k = 0; k < objYoyakus.length; k++) {

      // 開始時間、終了時間を分に変換する
      const starttime = tool.getMByHhmm(objYoyakus[k].time_start);
      const endtime = tool.getMByHhmm(objYoyakus[k].time_end);

      // 予約情報を時間オブジェクトに設定する
      for (let j = starttime; j < endtime; j+=30) {
        index = tool.getHhmmByM(j);
        times[index] = objYoyakus[k];
      }
    }
  }
  return times;
}



module.exports = router;
