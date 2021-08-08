const express = require('express');
const router = express.Router();
const multer = require('multer-firebase');
const moment = require('moment');
const path = require('path');
const os = require('os');
const convert = require('heic-convert');
const admin = require('firebase-admin');

const linkageDataBase = require('../common/linkageDataBase');
const util = require('../common/util');

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

/* ログイン画面表示 */
router.get("/login", (obj_a_req, obj_a_resp) => {
  obj_a_req.session.authFlag == undefined ? false : obj_a_req.session.authFlag;

  if (obj_a_req.session.authFlag) {
    obj_a_resp.redirect('/account_detail');
  } else {
    obj_a_resp.render('client/login', { authFlag: obj_a_req.session.authFlag });
  }
});

/* ログイン処理 */
router.post("/loginAjax", (obj_a_req, obj_a_resp) => {
  let obj_s_postData = obj_a_req.body;

  /* DB連携 */
  linkageDataBase.obj_g_getUserInfo(obj_s_postData.id, obj_s_postData.pw)
    .then(function (obj_a_userInfo) {
      let obj_s_responseData = {};
      /* ログイン判定 */
      if (obj_a_userInfo == "") {
        obj_s_responseData = { 'result': false }
      } else {
        obj_a_req.session.userInfo = obj_a_userInfo;
        obj_a_req.session.authFlag = true;
        obj_s_responseData = { 'result': true }
      }
      obj_a_resp.json(obj_s_responseData);
    }).catch(function (obj_a_err) {
      obj_a_req.session.errMessage = obj_a_err;
      let obj_s_responseData = { 'result': 'error' }
      obj_a_resp.json(obj_s_responseData);
    });
});

/* ログアウト */
router.get("/logout", (obj_a_req, obj_a_resp) => {
  obj_a_req.session.destroy(function () {
    obj_a_req.session;
    obj_a_resp.redirect('/login');
  });
});

/* 社員詳細情報画面表示 */
router.get("/account_detail", (obj_a_req, obj_a_resp) => {
  console.log(obj_a_req.session.userInfo);
  /* ログインチェック */
  if (obj_a_req.session.authFlag == false || obj_a_req.session.authFlag == undefined) {
    obj_a_resp.redirect('/login');
  } else {
    obj_a_resp.render('client/account_detail', { authFlag: obj_a_req.session.authFlag, userInfo: obj_a_req.session.userInfo });
  }
});

/* 社員詳細情報修正画面表示 */
router.get("/account_modify", (obj_a_req, obj_a_resp) => {
  /* ログインチェック */
  if (obj_a_req.session.authFlag == false || obj_a_req.session.authFlag == undefined) {
    obj_a_resp.redirect('/login');
  } else {
    obj_a_resp.render('client/account_modify', { authFlag: obj_a_req.session.authFlag, userInfo: obj_a_req.session.userInfo });
  }
});

/* 社員詳細情報修正処理 */
router.post("/account_modify", (obj_a_req, obj_a_resp) => {
  /* ログインチェック */
  if (obj_a_req.session.authFlag == false || obj_a_req.session.authFlag == undefined) {
    obj_a_resp.redirect('/login');
  } else {
    obj_a_req.body.user_pw = obj_a_req.session.userInfo.user_pw;

    /* DB連携 */
    linkageDataBase.obj_g_userInfoModify(obj_a_req.body, obj_a_req.session.userInfo.updateKey).then(function (obj_a_res) {
      /* 更新情報再設定 */
      obj_a_req.session.userInfo = obj_a_req.body;
      obj_a_resp.redirect('/account_detail');
    }).catch(function (obj_a_error) {
        /* エラー画面遷移 */
        obj_a_resp.render('error', { obj_a_error });
    });
  }
});

/* 経費管理処理 */
router.get("/expenses_write", (obj_a_req, obj_a_resp) => {
  /* ログインチェック */
  if (obj_a_req.session.authFlag == false || obj_a_req.session.authFlag == undefined) {
    obj_a_resp.redirect('/login');
  } else {
    obj_a_resp.render('expenses/expenses_write', { authFlag: obj_a_req.session.authFlag });
  }
});

/* 打刻画面 */
router.get("/stamping", (obj_a_req, obj_a_resp) => {
  obj_a_req.session.authFlag == undefined ? false : obj_a_req.session.authFlag;

  if (obj_a_req.session.authFlag) {
    let str_t_nowDate = moment().format("YYYYMMDD");

    /* DB連携 */
    linkageDataBase.obj_g_getStampingInfo(obj_a_req.session.userInfo.user_id, str_t_nowDate)
      .then(function (obj_a_respStamping) {
        obj_a_req.session.stamping_info = obj_a_respStamping;

        let str_s_getStatas = "";
        if (obj_a_respStamping.stamping_statas == "" || obj_a_respStamping.stamping_statas == undefined) {
          str_s_getStatas = "未出勤";
        } else {
          str_s_getStatas = obj_a_respStamping.stamping_statas;
        }
        obj_a_resp.render('stamping/stamping', { authFlag: obj_a_req.session.authFlag, statas: str_s_getStatas });
      }).catch(function (obj_a_error) {
        /* エラー画面遷移 */
        obj_a_resp.render('error', { obj_a_error });
      });
  } else {
    obj_a_resp.render('client/login', { authFlag: obj_a_req.session.authFlag });
  }
});

/* 打刻処理 */
router.post("/stamping", (obj_a_req, obj_a_resp) => {
  /* ログインチェック */
  if (obj_a_req.session.authFlag == false || obj_a_req.session.authFlag == undefined) {
    obj_a_resp.redirect('/login');
  } else {
    let obj_t_formData = obj_a_req.body;
    let obj_t_stempingData = obj_a_req.session.stamping_info;

    /* 日付取得 */
    let str_t_nowDate = moment().format("YYYYMMDD");

    let flag = obj_t_stempingData.stamping_statas == "勤務中" ? true : false;
    if (flag) {
      /* DB連携 */
      linkageDataBase.obj_g_stampingInfoModify(obj_a_req.session.userInfo.user_id, str_t_nowDate,
        obj_t_stempingData.stamping_start, obj_t_formData.stamping_time, obj_t_formData.stamping_text,
        "退社済", obj_t_stempingData.updateKey)
        .then(function () {
          obj_a_resp.redirect('/stamping');
        }).catch(function (obj_a_err) {
          /* エラー画面遷移 */
          obj_a_resp.render('error', { obj_a_err });
        });
    } else {
      /* DB連携 */
      linkageDataBase.obj_g_stampingInfoRegister(obj_a_req.session.userInfo.user_id, str_t_nowDate,
        obj_t_formData.stamping_time, "", obj_t_formData.stamping_text,
        "勤務中")
        .then(function () {
          obj_a_resp.redirect('/stamping');
        }).catch(function (obj_a_err) {
          /* エラー画面遷移 */
          obj_a_resp.render('error', { obj_a_err });
        });
    }
  }
});

/* 勤務簿画面表示 */
router.get("/stamping_check", (obj_a_req, obj_a_resp) => {
  obj_a_req.session.authFlag == undefined ? false : obj_a_req.session.authFlag;

  if (obj_a_req.session.authFlag) {
    let str_t_nowMonth = "";

    if (obj_a_req.query.prev_month != undefined && obj_a_req.query.prev_month != "") {
      str_t_nowMonth = moment(obj_a_req.query.prev_month).add(-1, "M").format("YYYYMM");
    } else if (obj_a_req.query.after_month != undefined && obj_a_req.query.after_month != "") {
      str_t_nowMonth = moment(obj_a_req.query.after_month).add(1, "M").format("YYYYMM");
    } else {
      /* 当月設定 */
      str_t_nowMonth = moment().format("YYYYMM");
    }
    console.log(str_t_nowMonth);
    /* DB連携 */
    linkageDataBase.obj_g_getNowMonthStampingInfo(obj_a_req.session.userInfo.user_id, str_t_nowMonth)
      .then(function (obj_a_respStamping) {
        obj_a_resp.render('stamping/stamping_check', { authFlag: obj_a_req.session.authFlag, datas: obj_a_respStamping, month: str_t_nowMonth });
      }).catch(function (obj_a_err) {
        /* エラー画面遷移 */
        obj_a_resp.render('error', { obj_a_err });
      });
  } else {
    obj_a_resp.render('client/login', { authFlag: obj_a_req.session.authFlag });
  }
});

/* 勤務簿詳細画面表示 */
router.get("/stamping_detail", (obj_a_req, obj_a_resp) => {
  /* ログインチェック */
  if (obj_a_req.session.authFlag == false || obj_a_req.session.authFlag == undefined) {
    obj_a_resp.redirect('/login');
  } else {
    /* DB連携 */
    linkageDataBase.obj_g_getStampingInfo(obj_a_req.session.userInfo.user_id, obj_a_req.query.stampingDate)
      .then(function (obj_a_respStamping) {
        obj_a_req.session.updateKey = obj_a_respStamping.updateKey;
        obj_a_req.session.stamping_start = obj_a_respStamping.stamping_start;
        obj_a_req.session.stamping_end = obj_a_respStamping.stamping_end;

        let obj_a_param = {};
        obj_a_param.targetDate = moment(obj_a_req.query.stampingDate).format("YYYY年MM月DD日");
        obj_a_req.session.targetDate = obj_a_param.targetDate;

        obj_a_param.userId = obj_a_req.session.userInfo.user_id;
        obj_a_param.stampingStart = obj_a_respStamping.stamping_start;
        obj_a_param.stampingEnd = obj_a_respStamping.stamping_end;

        obj_a_resp.render('stamping/stamping_detail', { authFlag: obj_a_req.session.authFlag, obj_a_param });
      })
      .catch(function (obj_a_error) {
        /* エラー画面遷移 */
        obj_a_resp.render('error', { obj_a_error });
      });
  }
});

let str_s_pdfFileName = "";

/* 初期ファイル名、ファイルpath設定 */
const storage = multer.diskStorage({
  /* 経路設定 */
  destination(obj_a_req, obj_a_file, obj_a_cb) {
    let str_s_tempPath = path.join(os.tmpdir(), obj_a_req.session.userInfo.user_id);
    /* tempフォルダ生成 */
    util.bln_s_isAccessCheck(str_s_tempPath)
      .then((bln_a_isAccess) => {
        console.log(str_s_tempPath + ' 存在チェック : ' + bln_a_isAccess);
        if (bln_a_isAccess) {
          return
        } else {
          return util.obj_s_makeDir(str_s_tempPath);
        }
      })
      .then(() => {
        return util.bln_s_isAccessCheck(str_s_tempPath);
      })
      .then(() => {
        obj_a_cb(null, str_s_tempPath);
      });
  },
  filename(obj_a_req, obj_a_file, obj_a_cb) {
    /* 画像形式判別 */
    if (obj_a_file.mimetype === 'application/pdf') {
      str_s_pdfFileName = obj_a_req.session.userInfo.user_id + '-' + String(moment().format('HHmmss')) + '.' + "pdf";
      /* ファイル名 + ファイル形式 */
      obj_a_cb(null, str_s_pdfFileName);
    } else {
      /* ファイル名 + ファイル形式 */
      obj_a_cb(null, obj_a_file.originalname);
    }
  },
});

/* multer設定 */
let obj_s_upload = multer({ storage: storage });

/* 証憑画像 */
router.post("/imageInsertAjax", obj_s_upload.single('attachment'), (obj_a_req, obj_a_resp) => {
  console.log(obj_a_req.file);
  /* pdf以外の場合 */
  if (obj_a_req.file.originalname.substr(-3) != "pdf") {
    let str_s_tempFileName = "";
    let str_t_resizeTempPath = "";
    /* Heicの場合 */
    if (obj_a_req.file.mimetype === "application/octet-stream") {
      let str_t_tempPath = path.join(os.tmpdir(), obj_a_req.session.userInfo.user_id, obj_a_req.file.originalname);
      /* Heic to png */
      util.obj_s_readFile(str_t_tempPath)
        .then((obj_a_inputBuffer) => {
          console.log(obj_a_inputBuffer);
          return convert({
            buffer: obj_a_inputBuffer,
            format: 'PNG',
            quality: 1
          });
        })
        .then((obj_a_outPutBuffer) => {
          console.log(obj_a_outPutBuffer);
          /* Heic to png new create */
          return util.obj_s_writeFile(str_t_tempPath, obj_a_outPutBuffer)
        })
        .then(() => {
          /* resize */
          return util.obj_s_makeFile(obj_a_req.session.userInfo.user_id, obj_a_req.file);
        })
        .then((str_a_fileName) => {
          str_s_tempFileName = str_a_fileName;
          console.log("-------resize success---------");
          str_t_resizeTempPath = path.join(os.tmpdir(), obj_a_req.session.userInfo.user_id, str_s_tempFileName);
          return util.obj_s_readFile(str_t_resizeTempPath)
        })
        .then((obj_a_buffer) => {
          return util.obj_s_setStorage(obj_a_buffer, obj_a_req.session.userInfo.user_id, str_s_tempFileName);
        }).then((obj_a_respUrl) => {
          console.log(obj_a_respUrl);
          console.log("-------storage register success---------");
          let obj_s_responseData = { 'path': obj_a_respUrl, 'id': str_s_tempFileName }
          obj_a_resp.json(obj_s_responseData);
        })
        .catch((obj_a_errData) => console.error(obj_a_errData));
      /* Heicの以外場合 */
    } else {
      /* resize */
      util.obj_s_makeFile(obj_a_req.session.userInfo.user_id, obj_a_req.file)
        .then((str_a_fileName) => {
          str_s_tempFileName = str_a_fileName;
          console.log("-------resize success---------");
          str_t_resizeTempPath = path.join(os.tmpdir(), obj_a_req.session.userInfo.user_id, str_s_tempFileName);
          return util.obj_s_readFile(str_t_resizeTempPath);
        })
        .then((obj_a_buffer) => {
          console.log(obj_a_buffer);
          /* storageに画像保存 */
          return util.obj_s_setStorage(obj_a_buffer, obj_a_req.session.userInfo.user_id, str_s_tempFileName);
        })
        .then((obj_a_respUrl) => {
          let obj_s_responseData = { 'path': obj_a_respUrl, 'id': str_s_tempFileName }
          obj_a_resp.json(obj_s_responseData);
        })
        .catch((obj_a_errData) => console.error(obj_a_errData));
    }
    /* PDFの場合 */
  } else {
    let str_t_pdfFilePath = path.join(os.tmpdir(), obj_a_req.session.userInfo.user_id, str_s_pdfFileName)

    util.obj_s_readFile(str_t_pdfFilePath)
      .then((obj_a_buffer) => {
        console.log(obj_a_buffer);
        /* storageに画像保存 */
        return util.obj_s_setStorage(obj_a_buffer, obj_a_req.session.userInfo.user_id, str_s_pdfFileName);
      })
      .then((obj_a_respUrl) => {
        let obj_s_responseData = { 'path': obj_a_respUrl, 'id': str_s_pdfFileName }
        obj_a_resp.json(obj_s_responseData);

      })
      .catch((obj_a_errData) => console.error(obj_a_errData));
  }
});

/* 証憑画像削除 */
router.post("/imageDeleteAjax", obj_s_upload.single('attachment'), (obj_a_req, obj_a_resp) => {
  let obj_s_tempNber = obj_a_req.body.split('-');

  const str_s_folderPath = moment().format('YYYYMMDD') + "/";
  firebaseAdmin.storage().bucket().deleteFiles({
    prefix: str_s_folderPath + obj_s_tempNber[0] + "/" + obj_a_req.body
  });

  let obj_s_responseData = { 'result': true }
  obj_a_resp.json(obj_s_responseData);
});

module.exports = router;

