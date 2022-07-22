const knex = require('../db/knex.js').connect();
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("users").where({id: id})
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("users").orderBy([{column: 'ymdhms_add', order:'desc'}])
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = "insert into users ( id, name, name_company, password, ymdhms_add, ymdhms_upd, ymdhms_del ) values ('" + inObj.id + "','" + inObj.name + "','" + inObj.name_company + "','" + inObj.password + "','" + inObj.ymdhms_add + "','" + inObj.ymdhms_upd + "','" + inObj.ymdhms_del + "')";
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        let query;
        if (inObj.password) {
            query = "update users set name = '" + inObj.name + "', name_company = '" + inObj.name_company + "', password = '" + inObj.password + "', ymdhms_add = '" + inObj.ymdhms_add + "', ymdhms_upd = '" + inObj.ymdhms_upd + "', ymdhms_del = '" + inObj.ymdhms_del + "' where id = '" + inObj.id + "'";
        } else {
            query = "update users set name = '" + inObj.name + "', name_company = '" + inObj.name_company + "', ymdhms_add = '" + inObj.ymdhms_add + "', ymdhms_upd = '" + inObj.ymdhms_upd + "', ymdhms_del = '" + inObj.ymdhms_del + "' where id = '" + inObj.id + "'";
        }
        logger.info(query);
        const retObj = await knex.raw(query)
        return retObj;
    } catch(err) {
        throw err;
    }
};

const remove = async (id) => {
    try {
        const query = "delete from users where id = '" + id + "'";
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