/**
 * Методы размещения флешки в html.
 * Выполняет инициализацию flashAPI и добавляет флешку в html.
 */
define(['jquery', 'flashApi', 'swfobject'],function($, flashApi){

    var containerId = "flashContent";
    var width = 400;
    var height = 300;

    function init(swfFilename, idName) {
        flashApi.init(idName);

        initFlashModule(swfFilename,idName);
        console.log('flashModule: initialized');
    }

    function initFlashModule(swfFilename, idName) {
        if( !idName ) {
            idName = "VCCamera";
        }
        // For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
        var swfVersionStr = "11.1.0";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string.
        var xiSwfUrlStr = "assets/playerProductInstall.swf";
        var flashvars = {};
        var params = {};
        params.quality = "high";
        params.bgcolor = "#ffffff";
        params.allowscriptaccess = "sameDomain";
        params.allowfullscreen = "true";
        var attributes = {};
        attributes.id = idName;
        attributes.name = idName;
        attributes.align = "middle";
        swfobject.embedSWF(
            swfFilename, containerId,
            width, height,
            swfVersionStr, xiSwfUrlStr,
            flashvars, params, attributes);
        // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
        swfobject.createCSS("#flashContent", "display:block;text-align:left;");
    }

    return{
        init:init
    };
});