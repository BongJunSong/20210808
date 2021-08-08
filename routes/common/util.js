'use strict';

const util = {};

const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const stream = require('stream');
const moment = require('moment');
const path = require('path');
const os = require('os');
const admin = require('firebase-admin');

/* Firebase 初期化 */
const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert({
      "type": "",
      "project_id": "",
      "private_key_id": "",
      "private_key": "",
      "client_email": "",
      "client_id": "",
      "auth_uri": "",
      "token_uri": "",
      "auth_provider_x509_cert_url": "",
      "client_x509_cert_url": ""
    }),
    storageBucket: ""
  }, "dest");
  

/**
* tempファイル存在チェック関数
* @param {Object} str_a_getPath -temp path
* @return {Promise} -処理結果
*/
util.bln_s_isAccessCheck = (str_a_getPath) => {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        fs.access(str_a_getPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (obj_a_err) => {
            if (obj_a_err) {
                if (obj_a_err.code === "ENOENT") {
                    obj_a_resolve(false);
                } else {
                    obj_a_reject(obj_a_err);
                }
            } else {
                obj_a_resolve(true);
            }
        });
    });
}

/**
* temp Folder生成関数
* @param {Object} str_a_getPath -temp path
* @return {Promise} -処理結果
*/
util.obj_s_makeDir = (str_a_getPath) => {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        fs.mkdir(str_a_getPath, (obj_a_err) => {
            if (obj_a_err) {
                obj_a_reject(obj_a_err);
            } else {
                console.log("mkdir Success");
                obj_a_resolve(true);
            }
        });
    });
};

/**
* 画像格納関数
* @param {String} str_a_userId -storage temp path
* @return {Promise} -処理結果
*/
util.obj_s_makeFile = (str_a_userId, obj_a_file) => {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        let str_t_fileName = str_a_userId + '-' + String(moment().format('HHmmss') + '.' + 'jpg');
        let str_t_tempPath = path.join(os.tmpdir(), str_a_userId, str_t_fileName);

        sharp(obj_a_file.path).resize({ width: 500 }).withMetadata().toFile(str_t_tempPath).
            then(function (obj_a_resp) {
                let str_s_deleteFilePath = path.join(os.tmpdir(), str_a_userId, obj_a_file.originalname);
                /* 原本画像削除 */
                fs.unlinkSync(str_s_deleteFilePath)
                obj_a_resolve(str_t_fileName);
            }).catch(function (obj_a_error) {
                obj_a_reject(obj_a_error);
            });
    });
};

/**
* HEIC画像読み込み関数
* @param {Object} str_a_getPath -temp path
* @return {Promise} -処理結果
*/
util.obj_s_readFile = (str_a_getPath) => {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        fs.readFile(str_a_getPath, (obj_a_err, obj_a_data) => {
            if (obj_a_err) {
                obj_a_reject(obj_a_err)
            } else {
                console.log("read file Success");
                obj_a_resolve(obj_a_data)
            }
        });
    })
}

/**
* HEIC画像書き込み関数
* @param {Object} str_a_getPath -temp path
* @return {Promise} -処理結果
*/
util.obj_s_writeFile = (str_a_getPath, obj_a_buffer) => {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        fs.writeFile(str_a_getPath, obj_a_buffer, (obj_a_err, obj_a_data) => {
            if (obj_a_err) {
                obj_a_reject(obj_a_err)
            } else {
                console.log("write file Success");
                obj_a_resolve(obj_a_data)
            }
        });
    })
}

util.obj_s_setStorage = (obj_s_buffer, str_a_contractMemId, str_a_fileName) => {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        /* Open Stream */
        let obj_t_bufferStream = new stream.PassThrough();
        /* Close Stream, buffer生成, asciiエンコーディング */
        obj_t_bufferStream.end(new Buffer.from(obj_s_buffer, 'ascii'));
        /* Create Object */
        let obj_t_file = firebaseAdmin.storage().bucket().file(str_a_contractMemId + '/' + str_a_fileName);

        let str_t_contentType = "";
        if (str_a_fileName.substr(-3) == "pdf") {
            str_t_contentType = "application/pdf";
        } else {
            str_t_contentType = "image/jpeg";
        }

        /* redableStream → writableStream */
        obj_t_bufferStream.pipe(obj_t_file.createWriteStream({
            metadata: {
                contentType: str_t_contentType
            }
        })).on('error', (obj_a_error) => {
            obj_a_reject(obj_a_error);
        }).on('finish', () => {
            const obj_a_config = {
                action: "read",
                expires: "03-17-2030"
            };

            obj_t_file.getSignedUrl(obj_a_config, (obj_a_err, str_a_url) => {
                if (obj_a_err) {
                    console.log(obj_a_err);
                    obj_a_reject(obj_a_err);
                }
                obj_a_resolve(str_a_url);
            });
        });
    });
}

util.obj_s_getStorageFileNames = function (str_a_tempNbr) {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        /* storageから登録対象の画像ファイル取得 */
        firebaseAdmin.storage().bucket().getFiles({ prefix: str_s_storageFolderName + '/' + str_a_tempNbr })
            .then((obj_a_files) => {
                obj_a_resolve(obj_a_files[0]);
            })
            .catch((obj_a_err) => {
                obj_a_reject(obj_a_err);
            });
    })
}

util.obj_s_getStorageFilesBuffer = function (obj_a_storageFile) {
    return new Promise((obj_a_resolve, obj_a_reject) => {
        const obj_a_config = {
            action: "read",
            expires: "03-17-2030"
        };

        let obj_s_getFileName = obj_a_storageFile.metadata.name.split("/");
        let obj_s_fileInfos = {};

        /* storageで画像のUrl取得 */
        obj_a_storageFile.getSignedUrl(obj_a_config, async (obj_a_err, str_a_url) => {
            if (obj_a_err) {
                console.log(obj_a_err);
                obj_a_reject(obj_a_err);
            }

            /* buffer変更 */
            const obj_s_response = await axios.get(str_a_url, { responseType: 'arraybuffer' });
            const obj_s_buffer = Buffer.from(obj_s_response.data, "ascii");
            obj_s_fileInfos[obj_s_getFileName[2]] = obj_s_buffer;
            obj_a_resolve(obj_s_fileInfos);
        });
    })
}

module.exports = util;