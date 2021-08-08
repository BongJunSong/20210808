const DEBUG = true;
const DOMAIN = DEBUG ? "http://localhost:5000" : "fbtest-dfa21.web.app"; 

/* 入力バリデーション */
jQuery(function ($) {
    $("#account-modify").on('click', function () {
        location.href = `${DOMAIN}/account_modify`;
    });
});