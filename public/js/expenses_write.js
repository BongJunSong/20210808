/* ファイルのアップロードのバリデーション */
jQuery(function ($) {
    $("#attachment").on("change", function () {
        let obj_s_imgFile = $(this);
        let obj_s_fileForm = /(.*?)\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|jfif|JFIF|heic|HEIC|pdf|PDF)$/;
        let num_s_maxSize = 5 * 1024 * 1024;
        let obj_s_file = obj_s_imgFile[0].files[0];

        if (num_s_maxSize < obj_s_file.size) {
            alert("5MB までのファイルがアップロード可能です。");
            obj_s_imgFile.val("");
            return false;
        }
        if (obj_s_file.size == 0) {
            alert("アップロードした画像が0バイトです。");
            obj_s_imgFile.val("");
            return false;
        }
        if (!obj_s_imgFile.val().match(obj_s_fileForm)) {
            alert("jpg・jpeg・png・gif・jfif・heic・pdf のみアップロードが可能です。");
            obj_s_imgFile.val("");
            return false;
        }

        let obj_s_form = $('#write')[0];
        let obj_s_data = new FormData(obj_s_form);

        $.ajax({
            url: "/imageInsertAjax",
            type: "POST",
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            data: obj_s_data,
            beforeSend: function () {
                $("#add-file").prop("disabled", true);
                $("#add-done").prop("disabled", true);
            },
            success: function (obj_a_result) {
                let obj_t_imgHtml = "";
                if (obj_s_imgFile.val().substr(-3) == "pdf") {
                    obj_t_imgHtml = '<span style="float:left; text-align:center; width:100%; margin-top: 20px; margin-bottom: 20px;"><a href= ' + obj_a_result.path + ' target="_blank" id=' + obj_a_result.id + '><img class="img-concert" src="/img/pdf.png"/></a>'
                    obj_t_imgHtml += '<button type="button" class="img-btn img-btn--raised" name="delete-file" id="delete-file" value=' + obj_s_imgFile.attr('id') + ' style="margin-bottom:30px;">ファイル削除</button></span>';
                } else {
                    obj_t_imgHtml = '<span style="float:left; text-align:center; width:100%; margin-top: 20px; margin-bottom: 20px;"><img src=' + obj_a_result.path + ' class="imgs_warp_img" id=' + obj_a_result.id + ' style="width:100%;">'
                    obj_t_imgHtml += '<button type="button" class="img-btn img-btn--raised" name="delete-file" id="delete-file" value=' + obj_s_imgFile.attr('id') + ' style="margin-bottom:30px;">ファイル削除</button>';
                }

                $("#img").append(obj_t_imgHtml);
                obj_s_imgFile.val("");
            },
            error: function (xhr, status, error) {
                console.log(error);
                obj_s_imgFile.val("");
                alert("登録できない画像です。他の画像でお願いします。");
            },
        });
    });
});

/* 削除ボタンイベント */
jQuery(function ($) {
    $("body").on("click", "[id^=delete-file]", function () {
        let str_s_filePath = $(this).siblings()[0].id;
        let str_s_getObj = $(this);

        $.ajax({
            url: "/imageDeleteAjax",
            type: "POST",
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            data: str_s_filePath,
            success: function (obj_a_result) {
                console.log(obj_a_result);
                str_s_getObj.parent().remove();
            },
            error: function (xhr, status, error) {
                console.log(error);
            },
        });
    });
});