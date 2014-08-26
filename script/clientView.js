define(['jquery', 'flashApi'],function($, flashApi){

    function init() {

        flashApi.initView(this);

        $('#btn-start').click(function() {
            flashApi.startVideochat();
        });
        $('#btn-stop').click(function() {
            flashApi.stopVideochat();
        });
    }

    function showError(msg) {
        alert(msg);
    }

    return{
        init: init,
        showError: showError
    };
});