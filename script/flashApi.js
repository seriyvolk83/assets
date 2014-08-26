/**
 * Здесь представлены методы для связи js c flash.
 * В init определяются global методы для вызова из flash.
 * В flashEvent при событии NetConnection.Connect.Success запускается периодический опрос сервера.
 */
define(['jquery', 'api', 'sessionState'],function($, api, sessionState) {

    var flashContainerIdName = null;
    var lastNewVideosessionFromServer = null;

    var STATE = {
        NOT_READY:0,
        READY_NOT_CONNECTED:1,
        READY:2,
        STARTING: 3,
        VIDEOCHAT: 4
    }
    var UI = {
        flashState: STATE.NOT_READY,
        javascriptReady: false,
        view: null,                                                             // clientView.js
        syncComponents: function() {
            // TODO вынести в clientView
            switch (UI.flashState) {
                case STATE.NOT_READY:
                case STATE.READY_NOT_CONNECTED:
                    $( "#btn-start" ).prop( "disabled", true );
                    $( "#btn-stop" ).prop( "disabled", true );
                    break;
                case STATE.READY:
                    $( "#btn-start" ).prop( "disabled", false );
                    $( "#btn-stop" ).prop( "disabled", true );
                    break
                case STATE.VIDEOCHAT:
                    $( "#btn-start" ).prop( "disabled", true );
                    $( "#btn-stop" ).prop( "disabled", false );
                    break
            }
        }
    }
    /**
     * Получает session с сервера и отправляет во флеш.
     * Вызывается из flash.
     *
     */
    function flashGetSession() {
        console.log('flashGetSession');
        api.createSession(function(res) {
            console.log('flashGetSession: res='+JSON.stringify(res));
            if( res.hasOwnProperty("result")) {
                if( res.result == "active") {
                    sessionState.setVideoSession(res);                  // Сохраняем текущую видеосессию

                    // todo проверить активная ли сессия
                    provideSession2Flash(res);
                }
                else if(res.result == "error") {
                    UI.view.showError(res.message);
                }
                else {
                    UI.view.showError("Unknown server response: " + JSON.stringify(res));
                }
            }
            else {
                UI.view.showError("Unknown error on server occur: " + JSON.stringify(res));
            }
        }, function(errorMessage) {
            console.log("flashGetSession: ERROR: "+errorMessage);
        });
    }

    function provideSession2Flash(res) {
        js2as3('jsSetSession', JSON.stringify(res));
    }

    function flashIsJsReady() {
        console.log('flashIsJsReady: '+UI.javascriptReady);
        return UI.javascriptReady;
    }

    /**
     * Вызывается, когда flash готов.
     */
    function flashSWFIsReady() {
        console.log("flashSWFIsReady");
        UI.flashState = STATE.READY_NOT_CONNECTED;
        UI.syncComponents();
    }
    function flashEvent(event) {
//        console.log("flashEvent: "+event);
        if( event == "NetConnection.Connect.Success" ) {
            UI.flashState = STATE.READY;
            UI.syncComponents();

            //  Запускаем периодический опрос сервера на предмет новых сессий и статуса старых.
            sessionState.init(function(videoSession) {
                lastNewVideosessionFromServer = videoSession;

//                if(view != null) {
//                   view.showIncomingVideochatDialog();
//                }
                acceptIncomingVideochat(); // TODO заменить на отображение диалога
            }, stopVideochat);

        }
        api.notifyEvent(event);
    }

    function acceptIncomingVideochat() {
        provideSession2Flash(lastNewVideosessionFromServer);
    }

    function flashState(event) {
        console.log("flashState: "+event);
        UI.flashState = STATE[event];
        UI.syncComponents();
    }
    function flashStarted(event) {
        console.log("flashStarted: "+event);
        UI.flashState = STATE.VIDEOCHAT;
        UI.syncComponents();
    }

    /**
     * Вызов функций во flash.
     * @param functionName имя функции (обычно начинается на "js*", например, "jsStart")
     * @param param
     */
    var js2as3 = function(functionName, param) {
        console.log("js2as3 ->: function="+functionName+" param="+param);

//        var app = $("#"+flashContainerIdName);
        var app = getSWF(flashContainerIdName);
//        var app = document.getElementById(flashContainerIdName);
        if( !app ) {
            console.log('js2as3: ERROR Flash container is not found');
            return;
        }
        try {
            if( !param ) {
                app[functionName]();
            }
            else {
                app[functionName](param);
            }
        }
        catch(ex) {
            console.log('Exception: '+ex);
//            console.log('js2as3: ERROR No such function in flash: function='+functionName);
        }
    }

    function getSWF(movieName)
    {
        if (navigator.appName.indexOf("Microsoft") != -1)
        {
            return window[movieName];
        }
        else
        {
            return document[movieName];
        }
    }

    function init(idName) {

        flashContainerIdName = idName;

        window.flashGetSession = flashGetSession;
        window.flashIsJsReady = flashIsJsReady;
        window.flashSWFIsReady = flashSWFIsReady;
        window.flashEvent = flashEvent;
        window.flashState = flashState;
        /////////////////////////////////////////////////////////////////
        UI.javascriptReady = true;                      // Flash при вызове flashIsJsReady увидит, что мы готовы
        UI.syncComponents();

        console.log('flashApi: initialized');
    }

    /**
     * Инициализация view компонентом, чтобы открывать диалоговые окна.
     * @param view
     */
    function initView(view) {
        UI.view = view;
    }

    function startVideochat() {
        js2as3("jsStart");
    }

    function stopVideochat() {
        sessionState.setVideoSession(null);
        js2as3("jsStop");
    }

    return{
        init:init,
        initView: initView,
        js2as3: js2as3,
        startVideochat: startVideochat,
        stopVideochat: stopVideochat,
        acceptIncomingVideochat: acceptIncomingVideochat
    };
});