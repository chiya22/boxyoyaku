const returnvalue = (value) => {
  return (value ? "'" + value + "'" : null);
};

/**
 * 日付よりyyyymmdd形式の文字列を返却する
 * @param {*} date 
 * @returns yyyymmdd形式の文字列
 */
const getYYYYMMDD = (date) => {
  let tmp;
  tmp = '' + date.getFullYear();
  tmp += '' + ('0' + (date.getMonth() + 1)).slice(-2);
  tmp += '' + ('0' + date.getDate()).slice(-2);
  return tmp
}

/**
 * 日付よりyyyymmddhhmmss形式の文字列を返却する
 * @param {*} date 
 * @returns yyyymmddhhmmss形式の文字列
 */
const getYYYYMMDDhhmmss = (date) => {
  let tmp;
  tmp = '' + date.getFullYear();
  tmp += '' + ('0' + (date.getMonth() + 1)).slice(-2);
  tmp += '' + ('0' + date.getDate()).slice(-2);
  tmp += '' + ('00' + date.getHours()).slice(-2);
  tmp += '' + ('00' + date.getMinutes()).slice(-2);
  tmp += '' + ('00' + date.getSeconds()).slice(-2);
  return tmp
}

/**
 * 年月より年月日のリストを取得する
 * @param {*} yyyymm 
 * @returns 
 */
const getYyyymmddByYyyymm = (yyyymm) => {

  // 末日を取得
  const lastday = new Date(yyyymm.slice(0, 4), yyyymm.slice(-2), 0).getDate();

  let retYyyymmdd = [];
  for (let i = 1; i <= lastday; i++) {
    retYyyymmdd.push(yyyymm + ('0' + i).slice(-2))
  }
  return retYyyymmdd;
}


module.exports = {
  returnvalue,
  getYYYYMMDD,
  getYYYYMMDDhhmmss,
  getYyyymmddByYyyymm,
};