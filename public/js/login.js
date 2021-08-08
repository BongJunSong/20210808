const DEBUG = true;
const DOMAIN = DEBUG ? "http://localhost:5000" : "fbtest-dfa21.web.app"; 

/* 入力バリデーション */
jQuery(function ($) {
    $("#login").on('click', function () {
        if ($("#user-id").val() == "" || $("#user-id").val() == undefined) {
            alert('会員番号を入力してください。');
            $("#user-id").focus();
            return false;
        }

        const valid = /^[0-9]+$/i;
        if (!valid.exec($("#user-id").val())) {
            alert('数字のみ入力してください。');
            $("#user-id").focus();
            return false;
        }

        if ($("#user-pw").val() == "" || $("#user-pw").val() == undefined) {
            alert('パスワードを入力してください。');
            $("#user-pw").focus();
            return false;
        }

        $.ajax({
            url: "/loginAjax",
            type: "POST",
            data: {
                "id": $("#user-id").val(),
                "pw": $("#user-pw").val(),
            },
            beforeSend: function () {
                LoadingWithMask();
            },
            success: function (obj_a_resp) {
                if (obj_a_resp.result) {
                    location.href = `${DOMAIN}/account_detail`;
                } else if (!obj_a_resp.result) {
                    alert("社員番号またはパスワードを確認してください。");
                    return false;
                } else {
                    location.href = `${DOMAIN}/error`;
                }
            },
            complete: function () {
                closeLoadingWithMask();
            }
        });
    });
});

/* Spinner */
function LoadingWithMask() {
    let mask = "<div id='mask' style='position:absolute; z-index:9000; background-color:#000000; display:none; left:0; top:0;'></div>";
    let loadingImg = '';

    loadingImg += "<div id='loadingImg' class='spinner'>";
    loadingImg += " <img src='/img/Spinner-1s-200px.gif' style='position: relative; display: block; margin: 0px auto;'/>";
    loadingImg += "</div>";

    $("body")
        .append(mask)
        .append(loadingImg)

    $('#mask').css({
        'width': "728px;"
        , 'opacity': '0.3'
    });

    $('#mask').show();
    $('#loadingImg').show();
}

function closeLoadingWithMask() {
    $('#mask, #loadingImg').hide();
    $('#mask, #loadingImg').remove();
}
