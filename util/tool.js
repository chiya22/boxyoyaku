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
 * yyyymmdd形式の文字列より、1日前のyyyymmdd形式の文字列を返却する
 * @param {*} YYYYMMDD 
 * @returns パラメータで指定されたYYYYMMDDの1日前
 */
 const getYYYYMMDDBefore = (YYYYMMDD) => {
  let beforedate = new Date(YYYYMMDD.slice(0, 4), YYYYMMDD.slice(4,6),YYYYMMDD.slice(-2));
  beforedate.setDate(beforedate.getDate() - 1);
  let tmp;
  tmp = '' + beforedate.getFullYear();
  tmp += '' + ('0' + (beforedate.getMonth())).slice(-2);
  tmp += '' + ('0' + beforedate.getDate()).slice(-2);
  return tmp
}

/**
 * yyyymmdd形式の文字列より、1日後のyyyymmdd形式の文字列を返却する
 * @param {*} YYYYMMDD 
 * @returns パラメータで指定されたYYYYMMDDの1日後
 */
 const getYYYYMMDDAfter = (YYYYMMDD) => {
  let afterdate = new Date(YYYYMMDD.slice(0, 4), YYYYMMDD.slice(4,6),YYYYMMDD.slice(-2));
  afterdate.setDate(afterdate.getDate() + 1);
  let tmp;
  tmp = '' + afterdate.getFullYear();
  tmp += '' + ('0' + (afterdate.getMonth())).slice(-2);
  tmp += '' + ('0' + afterdate.getDate()).slice(-2);
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

/**
 * HHMM形式を変換して分で返却する
 * @param {*} hhmm HHMM形式
 * @returns 分（例：0130の場合、90）
 */
const getMByHhmm = (hhmm) => {

  const h = Number(hhmm.slice(0,2)) * 60
  const m = Number(hhmm.slice(-2))
  return h + m;

}

/**
 * 分をHHMM形式で返却する
 * @param {*} m 分
 * @returns HHMM形式（例：90分の場合、0130）
 */
const getHhmmByM = (m) => {
  if (m !== 0) {
    const hh = ("0" + String(Math.floor(m / 60))).slice(-2);
    const mm = ("0" + String(m % 60)).slice(-2);6
    return hh + mm;
  } else {
    return "0000";
  }
}

/**
 * 引数で渡された年月日時分秒の6時間後の年月日時分秒を取得する
 * @param {*} yyyymmddhhmmss 
 */
const getPlus6hour = (yyyymmddhhmmss) => {

  let afterdate = new Date(yyyymmddhhmmss.slice(0, 4), yyyymmddhhmmss.slice(4,6),yyyymmddhhmmss.slice(6,8),yyyymmddhhmmss.slice(8,10),yyyymmddhhmmss.slice(10,12),yyyymmddhhmmss.slice(12,14));
  afterdate.setHours(afterdate.getHours() + 6);
  let tmp;
  tmp = '' + afterdate.getFullYear();
  tmp += '' + ('0' + (afterdate.getMonth()+1)).slice(-2);
  tmp += '' + ('0' + afterdate.getDate()).slice(-2);
  tmp += '' + ('0' + afterdate.getHours()).slice(-2);
  tmp += '' + ('0' + afterdate.getMinutes()).slice(-2);
  tmp += '' + ('0' + afterdate.getSeconds()).slice(-2);
  return tmp
}

/**
 * 現在の日付より1時間前の日付を取得する
 */
const getCalchour = (num) => {
  let afterdate = new Date();
  afterdate.setHours(afterdate.getHours() + num);
  let tmp;
  tmp = '' + afterdate.getFullYear();
  tmp += '' + ('0' + (afterdate.getMonth()+1)).slice(-2);
  tmp += '' + ('0' + afterdate.getDate()).slice(-2);
  tmp += '' + ('0' + afterdate.getHours()).slice(-2);
  tmp += '' + ('0' + afterdate.getMinutes()).slice(-2);
  tmp += '' + ('0' + afterdate.getSeconds()).slice(-2);
  return tmp  
}

module.exports = {
  returnvalue,
  getYYYYMMDD,
  getYYYYMMDDBefore,
  getYYYYMMDDAfter,
  getYYYYMMDDhhmmss,
  getYyyymmddByYyyymm,
  getMByHhmm,
  getHhmmByM,
  getPlus6hour,
  getCalchour,
};