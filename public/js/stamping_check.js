const DEBUG = true;
const DOMAIN = DEBUG ? "http://localhost:5000" : "fbtest-dfa21.web.app"; 

jQuery(function ($) {
    $("#prev-month").on("click", function () {
        $("#prev-month").val($("#now-month").val());
    });

    $("#after-month").on("click", function () {
        $("#after-month").val($("#now-month").val());
    });
});