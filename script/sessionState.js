/**
 * Хранит и проверяет состояние текущей видео сессии.
 * Периодическая проверка сервера запускается в init.
 */
define(['jquery', 'api'],function($, api){

    var videoSession = null;
    var intervalID;
    var callbacks = {
        startVideoSessionCallback: null,
        stopVideoSessionCallback: null
    }

    /**
     * Используется, чтобы не выводить каждый ответ от сервера при периодических проверках  checkExistionSession.
     * Выводятся только новые ответы.
     */
    var loggerLastResult = null;

    /**
     * Инициализируется callbacks для выполнения запуска и останова видеочата.
     */
    function init(startVideoSessionCallback, stopVideoSessionCallback) {
        console.log('api: initialized');
        callbacks.startVideoSessionCallback = startVideoSessionCallback;
        callbacks.stopVideoSessionCallback = stopVideoSessionCallback;

        intervalID = setInterval(checkExistionSession, 3000);
    }

    function setVideoSession(sess) {
        videoSession = sess;
    }

    /**
     * Выполняет однократную проверку видеосессий на сервере и выполняет обработку.
     * Либо закрывает текущую видеосессию, либо показывает, что есть новая (tryAcceptSession).
     * Если приходит новая видеосессия, а у нас уже есть другая активная, то логгирует ошибку.
     */
    function checkExistionSession() {
//        console.log('checkExistionSession');
        api.checkSession(function(res) {
            logCheckSessionResult(res);
            if(!res.hasOwnProperty("result")) {
                console.log("ERROR: Wrong server result for checkSession api");
                return;
            }

            if( hasActiveSession() ) {
                if(isCurrentSameAsGiven(res)) {
                    if(res.result == "closed") {
                        videoSession = null;
                        tryCloseSession();
                    }
                }
                else {
                    api.notifyError("IllegalState: currentVideoSession.vs_hash="+videoSession.video_session_hash+" checkSession.res.vs_hash="+res.video_session_hash);
                }
            }
            else {
                if(res.result == "active") {                        // Кто-то к нам подключился
                    videoSession = res;
                    tryAcceptSession();
                }
            }
        }, function(errorMessage) {
            console.log("checkExistionSession: ERROR: "+errorMessage);
        });
    }
    function logCheckSessionResult(res) {
        var str = JSON.stringify(res);
        if(loggerLastResult != str) {
            loggerLastResult = str;
            console.log('checkExistionSession: res='+str);
        }
    }

    function hasActiveSession() {
        return videoSession != null;
    }

    /**
     * Проверяет совпадают ли id видеосессий - текущая и полученная с сервера.
     */
    function isCurrentSameAsGiven(res) {
        if(videoSession == null) {
            throw "IllegalStateException";
        }
        if(!res.hasOwnProperty("video_session_hash")) {     // res== {result:no}
            return false;
        }
        return videoSession.video_session_hash == res.video_session_hash;
    }

    /**
     * Вызывается, когда js понимает, что запрос на видеочат с нами.
     */
    function tryAcceptSession() {
        callbacks.startVideoSessionCallback(videoSession);
    }

    /**
     * Вызывается, когда js понимает, что нужно закрыть видеосессию.
     */
    function tryCloseSession() {
        callbacks.stopVideoSessionCallback();
    }

    return{
        init: init,
        setVideoSession: setVideoSession       // Должен вызываться при инициировании соединения нами
    };
});