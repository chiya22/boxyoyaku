const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("boxs").where({id: id})
        return retObj;
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("boxs").orderBy([{column: 'id', order:'asc'}])
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into boxs ( id, name ) values ('" + inObj.id + "','" + inObj.name + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = "update boxs set name = '" + inObj.name + "' where id = '" + inObj.id + "'";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
    } catch(err) {
        throw err;
    }
};

const remove = async (id) => {
    try {
        const query = "delete from boxs where id = '" + id + "'";
        const retObj = await knex.raw(query)
        return retObj;
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findPKey,
    insert,
    update,
    remove,
};