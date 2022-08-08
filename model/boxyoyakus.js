const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id,ymdhms_add) => {
    try {
        const retObj = await knex.from("boxyoyakus").where([{id: id},{ymdhms_add: ymdhms_add}])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * idにおいて有効な予約情報を取得する
 * @param {*} id 予約情報を取得するユーザー
 * @returns BOX予約情報（1件)
 */
const findYoyakuByUser = async (id) => {
    try {
        const retObj = await knex.from("boxyoyakus").where({id_user: id}).andWhere({ymdhms_del: "99991231235959"});
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

/**
 * 日付と部屋番号をもとに、予約情報を取得する
 * @param {*} ymd 予約情報を取得する日付
 * @param {*} id_room 予約情報を取得する部屋番号
 * @returns BOX予約情報（複数）
 */
const findYoyakusByYmdAndRoom = async(ymd, id_room) => {
    try {
        const query = "SELECT b.*, u.name FROM (SELECT * from boxyoyakus WHERE ymd_yoyaku = '" + ymd + "' AND id_room = '" + id_room + "') b LEFT OUTER JOIN users u ON  b.id_user = u.id"
        const retObj = await knex.raw(query);
        return retObj.rows;
    } catch(err) {
        throw err;
    }
}

const find = async () => {
    try {
        const retObj = await knex.from("boxyoyakus").orderBy("ymdhms_add","desc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into boxyoyakus values ('" + inObj.id + "','" + inObj.ymd_yoyaku + "','" + inObj.id_room + "','" + inObj.time_start + "','" + inObj.time_end + "','" + inObj.ymdhms_add + "','" + inObj.ymdhms_del + "')";
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
        const query = "delete from boxyoyakus where id = '" + id + "' and ymdhms_add = '" + ymdhms_add + "'";
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
    insert,
    remove,
};