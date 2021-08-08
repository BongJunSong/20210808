'use strict';

const linkageDataBase = {};

const axios = require('axios');
const moment = require('moment');

const databaseURL = "";

/**
* 社員情報取得関数
* @param {String} str_a_userId -社員番号
* @param {String} str_a_userPw -パスワード
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_getUserInfo = function (str_a_userId, str_a_userPw) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {

        /* Firebase DB連携 */
        axios.get(`${databaseURL}/user_list.json`).then(function (obj_a_resp) {
            if (obj_a_resp.status == "200") {
                let count = 0;
                Object.keys(obj_a_resp.data).forEach(function (obj_a_curKey) {
                    let obj_a_curData = obj_a_resp.data[obj_a_curKey];
                    if (str_a_userId.includes(obj_a_curData.user_id) &&
                        str_a_userPw.includes(obj_a_curData.user_pw)) {
                        obj_a_curData.updateKey = obj_a_curKey;
                        obj_a_resolve(obj_a_curData)
                    }
                    count = count + 1;
                });

                if (Object.keys(obj_a_resp.data).length == count) {
                    obj_a_resolve("")
                }
            } else {
                console.error("DB連携失敗：" + obj_a_resp.statusText);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            }
        }).then(function (obj_a_resp) {
            obj_a_resolve(obj_a_resp);
        }).catch(function (obj_a_err) {
            console.error("DB連携失敗：" + obj_a_err);
            obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
        });
    });
}

/**
* 社員情報登録関数
* @param {Object} obj_a_userInfo -社員情報
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_userInfoResister = function (obj_a_userInfo) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {

        /* Firebase DB連携 */
        axios.post(`${databaseURL}/user_list.json`, JSON.stringify(obj_a_userInfo)).then(function (obj_a_resp) {
            if (obj_a_resp.status == "200") {
                obj_a_resolve(obj_a_resp.status);
            } else {
                console.error("DB連携失敗：" + obj_a_resp.statusText);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            }
        }).catch(function (obj_a_err) {
            console.error("DB連携失敗：" + obj_a_err);
            obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
        });
    });
}

/**
* 社員情報登録関数
* @param {Object} obj_a_userInfo -社員情報
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_userInfoModify = function (obj_a_body) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {
        /* Firebase DB連携 */
        axios.put(`${databaseURL}/user_list/${obj_a_body.updateKey}.json`, obj_a_body)
            .then(function (obj_a_resp) {
                if (obj_a_resp.status == "200") {
                    console.log("社員情報更新成功");
                    obj_a_resolve(obj_a_resp.status);
                } else {
                    console.error("DB連携失敗：" + obj_a_resp.statusText);
                    obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
                }
            }).catch(function (obj_a_err) {
                console.error("DB連携失敗：" + obj_a_err);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            });
    });
}

/**
* 本日の打刻情報取得関数
* @param {String} str_a_userId -社員番号
* @param {String} str_a_nowDate -DATE
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_getStampingInfo = function (str_a_userId, str_a_nowDate) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {

        /* Firebase DB連携 */
        axios.get(`${databaseURL}/user_stamping.json`).then(function (obj_a_resp) {
            if (obj_a_resp.status == "200") {
                if (Object.keys(obj_a_resp.data).length > 0) {
                    let count = 0;
                    Object.keys(obj_a_resp.data).forEach(function (obj_a_curKey) {
                        let obj_a_curData = obj_a_resp.data[obj_a_curKey];
                        if (str_a_userId == obj_a_curData.user_id &&
                            str_a_nowDate == obj_a_curData.stamping_date) {

                            obj_a_curData.updateKey = obj_a_curKey;
                            obj_a_resolve(obj_a_curData);
                        }
                        count = count + 1;
                    });

                    if (Object.keys(obj_a_resp.data).length == count) {
                        obj_a_resolve("")
                    }

                } else {
                    obj_a_resolve("");
                }
            } else {
                console.error("DB連携失敗：" + obj_a_resp.statusText);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            }
        }).catch(function (obj_a_err) {
            console.error("DB連携失敗：" + obj_a_err);
            obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
        });
    });
}

/**
* 当月分の打刻情報取得関数
* @param {String} str_a_userId -社員番号
* @param {String} str_a_nowDate -当月
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_getNowMonthStampingInfo = function (str_a_userId, str_a_nowMonth) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {

        /* Firebase DB連携 */
        axios.get(`${databaseURL}/user_stamping.json`).then(function (obj_a_resp) {
            if (obj_a_resp.status == "200") {
                if (Object.keys(obj_a_resp.data).length > 0) {
                    let count = 0;
                    let obj_t_promise = [];
                    Object.keys(obj_a_resp.data).forEach(function (obj_a_curKey) {
                        let obj_t_curData = obj_a_resp.data[obj_a_curKey];
                        let str_t_getNowDate = moment(obj_t_curData.stamping_date).format("YYYYMM");

                        if (str_a_userId == obj_t_curData.user_id &&
                            str_a_nowMonth == str_t_getNowDate) {
                            /* 勤務時間計算 */
                            if (obj_t_curData.stamping_statas == "退社済") {
                                let obj_t_startArray = obj_t_curData.stamping_start.split(':');
                                let obj_t_endArray = obj_t_curData.stamping_end.split(':');
                                let obj_t_getDate = obj_t_curData.stamping_date;

                                let obj_s_start =
                                    new Date(obj_t_getDate.substring(0, 4), obj_t_getDate.substring(5, 7),
                                        obj_t_getDate.substring(8, 10), obj_t_startArray[0], obj_t_startArray[1], obj_t_startArray[2]);

                                let obj_s_end =
                                    new Date(obj_t_getDate.substring(0, 4), obj_t_getDate.substring(5, 7),
                                        obj_t_getDate.substring(8, 10), obj_t_endArray[0], obj_t_endArray[1], obj_t_endArray[2]);

                                let str_s_workTime = obj_s_end.getTime() - obj_s_start.getTime();
                                str_s_workTime = str_s_workTime / 1000 / 60 / 60;
                                obj_t_curData.workTime = String(str_s_workTime).split(".")[0];
                            }

                            obj_t_promise.push(obj_t_curData);
                        }
                        count = count + 1;
                    });

                    if (Object.keys(obj_a_resp.data).length == count) {
                        obj_a_resolve(obj_t_promise);
                    }

                } else {
                    obj_a_resolve("");
                }
            } else {
                console.error("DB連携失敗：" + obj_a_resp.statusText);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            }
        }).catch(function (obj_a_err) {
            console.error("DB連携失敗：" + obj_a_err);
            obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
        });
    });
}

/**
* 打刻情報更新関数
* @param {String} str_a_userId -社員番号
* @param {String} str_a_nowDate -NOWDATE
* @param {String} str_a_stampingStart -出社時間
* @param {String} str_a_stampingEnd -退社時間
* @param {String} str_a_stampingText -備考
* @param {String} str_a_stampingStatas -打刻ステータス
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_stampingInfoRegister = function (str_a_userId, str_a_nowDate,
    str_a_stampingStart, str_a_stampingEnd, str_a_stampingText, str_a_stampingStatas) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {

        const obj_s_body = {
            "user_id": str_a_userId,
            "stamping_date": str_a_nowDate,
            "stamping_start": str_a_stampingStart,
            "stamping_end": str_a_stampingEnd,
            "stamping_text": str_a_stampingText,
            "stamping_statas": str_a_stampingStatas
        }

        console.table(obj_s_body);
        /* Firebase DB連携 */
        axios.post(`${databaseURL}/user_stamping.json`, JSON.stringify(obj_s_body)).then(function (obj_a_resp) {
            if (obj_a_resp.status == "200") {
                obj_a_resolve(obj_a_resp.status);
            } else {
                console.error("DB連携失敗：" + obj_a_resp.statusText);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            }
        }).catch(function (obj_a_err) {
            console.error("DB連携失敗：" + obj_a_err);
            obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
        });
    });
}

/**
* 打刻情報更新関数
* @param {String} str_a_userId -社員番号
* @param {String} str_a_nowDate -NOWDATE
* @param {String} str_a_stampingStart -出社時間
* @param {String} str_a_stampingEnd -退社時間
* @param {String} str_a_stampingText -備考
* @param {String} str_a_stampingStatas -打刻ステータス
* @param {String} str_a_updateKey -更新キー
* @return {Promise} -処理結果
*/
linkageDataBase.obj_g_stampingInfoModify = function (str_a_userId, str_a_nowDate,
    str_a_stampingStart, str_a_stampingEnd, str_a_stampingText, str_a_stampingStatas, str_a_updateKey) {
    return new Promise(function (obj_a_resolve, obj_a_reject) {

        const obj_s_body = {
            "user_id": str_a_userId,
            "stamping_date": str_a_nowDate,
            "stamping_start": str_a_stampingStart,
            "stamping_end": str_a_stampingEnd,
            "stamping_text": str_a_stampingText,
            "stamping_statas": str_a_stampingStatas
        }

        /* Firebase DB連携 */
        axios.put(`${databaseURL}/user_stamping/${str_a_updateKey}.json`, obj_s_body)
            .then(function (obj_a_resp) {
                if (obj_a_resp.status == "200") {
                    obj_a_resolve(obj_a_resp.status);
                } else {
                    console.error("DB連携失敗：" + obj_a_resp.statusText);
                    obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
                }
            }).catch(function (obj_a_err) {
                console.error("DB連携失敗：" + obj_a_err);
                obj_a_reject("予期せぬエラーが発生しました。\r\nシステム管理者にお問い合わせください。");
            });
    });
}

module.exports = linkageDataBase;