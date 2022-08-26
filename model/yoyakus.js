const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();
const tool = require("../util/tool");

const findPKey = async (id,ymdhms_add) => {
    try {
        const retObj = await knex.from("yoyakus").where([{id: id},{ymdhms_add: ymdhms_add}])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * idにおいて有効な予約情報を取得する（部屋名つき）
 * @param {*} id 予約情報を取得するユーザー
 * @returns 予約情報（1件)
 */
const findYoyakuByUser = async (id) => {
    try {
        const yyyymmddhhmm = tool.getYYYYMMDDhhmmss(new Date()).slice(0,12);
        const query = "SELECT a.*, r.name AS name_room FROM (SELECT * FROM yoyakus a WHERE a.id_user = '" + id + "' AND concat(a.ymd_yoyaku, a.time_end) >= '" + yyyymmddhhmm + "' and a.ymdhms_del = '99991231235959') a LEFT OUTER JOIN rooms r ON a.id_room = r.id"
        // const query = "SELECT a.*, r.name AS name_room FROM (SELECT * FROM yoyakus a WHERE a.id_user = '" + id + "' AND a.ymdhms_del = '99991231235959') a LEFT OUTER JOIN rooms r ON a.id_room = r.id"
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj.rows[0];
    } catch(err) {
        throw err;
    }
}

/**
 * 日付と部屋番号をもとに、予約情報を取得する
 * @param {*} ymd 予約情報を取得する日付
 * @param {*} id_room 予約情報を取得する部屋番号
 * @returns 予約情報（複数）
 */
const findYoyakusByYmdAndRoom = async(ymd, id_room) => {
    try {
        const query = "SELECT b.*, u.name FROM (SELECT * from yoyakus WHERE ymd_yoyaku = '" + ymd + "' AND id_room = '" + id_room + "') b LEFT OUTER JOIN users u ON  b.id_user = u.id"
        const retObj = await knex.raw(query);
        return retObj.rows;
    } catch(err) {
        throw err;
    }
}

/**
 * 日付と部屋番号と開始時刻、終了時刻をもとに、重複している予約情報を取得する
 * @param {*} ymd 予約情報を取得する日付
 * @param {*} id_room 予約情報を取得する部屋番号
 * @param {*} time_start 予約情報を取得する開始時間
 * @param {*} time_end 予約情報を取得する終了時間
 * @returns 予約情報（複数）
 */
const findYoyakuByDuplicate = async(ymd,id_room,time_start,time_end) => {
    try {
        const query = "SELECT * FROM yoyakus b WHERE b.ymd_yoyaku = '" + ymd + "' AND b.id_room = '" + id_room + "' AND b.time_end > '" + time_start + "' AND b.time_start < '" + time_end + "'"
        logger.info(query);
        const retObj = await knex.raw(query);
        return retObj;
    } catch(err) {
        throw err;
    }
}

const find = async () => {
    try {
        const retObj = await knex.from("yoyakus").orderBy("ymdhms_add","desc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into yoyakus values ('" + inObj.id_user + "','" + inObj.ymd_yoyaku + "','" + inObj.id_room + "','" + inObj.time_start + "','" + inObj.time_end + "','" + inObj.ymdhms_add + "','" + inObj.ymdhms_del + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        // Postgres
        return retObj;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (id, ymdhms_add) => {
    try {
        const query = "delete from yoyakus where id_user = '" + id + "' and ymdhms_add = '" + ymdhms_add + "'";
        const retObj = await knex.raw(query)
        // Postgres
        return retObj;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findPKey,
    findYoyakuByUser,
    findYoyakusByYmdAndRoom,
    findYoyakuByDuplicate,
    insert,
    remove,
};