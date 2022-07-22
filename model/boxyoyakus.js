const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();
const tool = require("../util/tool");

const findPKey = async (yyyymm) => {
    try {
        const retObj = await knex.from("yms").where({yyyymm: yyyymm})
        return retObj;
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("yms").orderBy("yyyymm","desc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findThreeMonth = async () => {
    try {
        let dt = new Date();
        const currentYm = tool.getYYYYMMDD(dt).slice(0,6);
        dt.setMonth(dt.getMonth() +1);
        const afterYm1 = tool.getYYYYMMDD(dt).slice(0,6);
        dt.setMonth(dt.getMonth() +1);
        const afterYm2 = tool.getYYYYMMDD(dt).slice(0,6);
        const query = "SELECT * FROM yms WHERE (yyyymm = '" + currentYm + "' OR yyyymm = '" + afterYm1 + "' OR yyyymm = '" + afterYm2 + "') ORDER BY yyyymm desc;"
        logger.info(query);
        const retObj = await knex.raw(query)
        // Postgres
        return retObj.rows;
        // MySql
        // return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = "insert into yms values ('" + inObj.yyyymm + "','" + inObj.status + "','" + inObj.ymd_add + "','" + inObj.id_add + "','" + inObj.ymd_upd + "','" + inObj.id_upd + "')";
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

const update = async (inObj) => {
    try {
        const query = "update yms set yyyymm = '" + inObj.yyyymm + "', status = '" + inObj.status + "', ymd_add = '" + inObj.ymd_add + "', id_add = '" + inObj.id_add + "', ymd_upd = '" + inObj.ymd_upd + "', id_upd = '" + inObj.id_upd + "' where yyyymm = '" + inObj.yyyymm + "'";
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

const remove = async (yyyymm) => {
    try {
        const query = "delete from yms where yyyymm = '" + yyyymm + "'";
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
    findThreeMonth,
    insert,
    update,
    remove,
};