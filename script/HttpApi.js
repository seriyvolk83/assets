/**
 * API реализация, обращение к серверу.
 */
define(['jquery'],function($){

    var domain = "http://localhost:8080";
    var session = null;

    /**
     * Сессия определяет то, с кем данный клиент общается.
     * @param sessionHash
     */
    function init(sessionHash) {
        session = sessionHash;
        console.log('api: initialized');
    }

    function getIdClient() {
        return session;
    }

    /**
     * В реализации сервера партнер определяется по сессии,
     * потому что текстовый чат устанавливается со строго определенным сотрудником.
     * @returns тоже, что и getIdClient()
     */
    function getIdPeer() {
        return session;
    }
    /**
     * Создает видео сессию на клиенте.
     */
    function createSession(callback, errorCallback) {
        var url = domain + "/createSession";
        httpRequest({
            type: "PUT",
            contentType : 'application/json',
            url: url,
            data: JSON.stringify({
                "id_client": getIdClient(),
                "id_actor": getIdPeer()
            })
        }, function(res) {
            if( res.hasOwnProperty("result") && (res["result"] == "active") ) {
                console.log("createSession: res="+res);
            }
            callback(res);
        }, errorCallback, "createSession");
    }


    function checkSession(callback, errorCallback) {
        var url = domain + "/checkSession";
        httpRequest({
            type: "POST",
            contentType : 'application/json',
            url: url,
            data: JSON.stringify({
                "id_client": getIdClient()
            })
        }, callback, errorCallback, "checkSession");
    }

    function notifyError(str) {
        notifyEvent({level:"error", message:str});
    }

    function notifyEvent(str) {
        var url = domain + "/notifyEvent";
        if(typeof(str) == "string" ) {
            str = {
                id_client:getIdClient(),
                level:"event",
                message:str
            };
        }
        console.log("notifyEvent: event->server: "+JSON.stringify(str));
//        return;
        httpRequest({
            type: "POST",
            contentType : 'application/json',
            url: url,
            data: JSON.stringify(str)
        }, function(res) {}, function(errorMessage) {
//            console.log("notifyEvent: ERROR: "+errorMessage);
        }, "notifyEvent");
    }

    function httpRequest(ajaxParams, callback, errorCallback, actionLabel) {
        $.ajax(ajaxParams)
            .done(function( msg ) {
//                console.log("httpRequest: " + actionLabel + ": results= " + JSON.stringify(msg));
                callback(msg);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                errorHandler(jqXHR, textStatus, errorThrown, errorCallback, actionLabel);
            });
    }

    function errorHandler(jqXHR, textStatus, errorThrown, errorCallback, label) {
        if( jqXHR.responseText != "" && jqXHR.hasOwnProperty('responseJSON')) {
            errorCallback(jqXHR.responseJSON.message+"");
            console.log(label+": ERROR body: "+jqXHR.responseJSON.message);
        }
        else {
            if( !errorThrown ) {
                errorThrown = "Server is not available";
            }
            errorCallback(errorThrown+"");
            console.log(label+": ERROR responseText: "+jqXHR.responseText);
        }
    }

    return{
        init: init,
        createSession: createSession,
        checkSession: checkSession,
        notifyError: notifyError,
        notifyEvent: notifyEvent
    };
});