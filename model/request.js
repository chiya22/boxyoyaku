const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (email, key) => {
    try {
        const retObj = await knex.from("request").where({email: email}).andWhere({key: key});
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByKey = async (key) => {
    try {
        const retObj = await knex.from("request").where({key: key})
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("request").orderBy([{column: 'ymd_limit', order:'desc'}])
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into request ( email, key, kubun, ymd_limit ) values ('" + inObj.email + "','" + inObj.key + "','" + inObj.kubun + "','" + inObj.ymd_limit + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findByKey,
    findPKey,
    insert,
};