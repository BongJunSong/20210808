jQuery(function ($) {
    $("#stamping-btn").on("click", function(){
        $("#stamping-time").val($("#click")[0].innerText);
    });
});

function str_s_getTime() {
    const clock = document.querySelector('#click');
    const time = new Date();
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    clock.innerHTML = `${hour < 10 ? `0${hour}` : hour}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

function init() {
    setInterval(str_s_getTime, 500);
}

init();