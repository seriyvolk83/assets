/**
 * Поддельная реализация API, для тестирования.
 *
 * Использовать в клиентах сессии 34589347583495 и 78934573489534.
 */
define(['jquery'],function($){

    var session = null;

    var fakeSessions = {
        1: {
            result:"active",
            video_session_hash: 1,
            video_stream_publish: 101,
            video_stream_play: 102,
            hash_publish: 123,
            hash_play: 123
        },
        2: {
            result:"active",
            video_session_hash: 1,
            video_stream_publish: 102,
            video_stream_play: 101,
            hash_publish: 123,
            hash_play: 123
        },
        3: {
            result:"active",
            video_session_hash: 2,
            video_stream_publish: 201,
            video_stream_play: 202,
            hash_publish: 123,
            hash_play: 123
        },
        4: {
            result:"active",
            video_session_hash: 2,
            video_stream_publish: 202,
            video_stream_play: 201,
            hash_publish: 123,
            hash_play: 123
        },
        5: {
            result:"active",
            video_session_hash: 3,
            video_stream_publish: 301,
            video_stream_play: 302,
            hash_publish: 123,
            hash_play: 123
        },
        6: {
            result:"active",
            video_session_hash: 3,
            video_stream_publish: 302,
            video_stream_play: 301,
            hash_publish: 123,
            hash_play: 123
        },
        7: {
            result:"active",
            video_session_hash: 4,
            video_stream_publish: 401,
            video_stream_play: 402,
            hash_publish: 123,
            hash_play: 123
        },
        8: {
            result:"active",
            video_session_hash: 4,
            video_stream_publish: 402,
            video_stream_play: 401,
            hash_publish: 123,
            hash_play: 123
        }
    }

    var activeSession = {};

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
    function getIdPeer() {
        return session;
    }
    /**
     * Создает видео сессию на клиенте.
     * @param session хэш получаемый с сервера при открытии страницы.
     */
    function createSession(callback) {
        var s = fakeSessions[session];
        if(s) {
            activeSession[session] = s;
            callback(s);
        }
        else {
            callback({
                "result": "error",
                "message": "Can't create new videosession"
            })
        }
    }

    function checkSession(callback) {
//        callback({
//            result:"no"
//        })
//        callback({
//            result:"closed",
//            video_session_hash: 111
//        });
        var session = activeSession[session];
        if(session) {
            callback(session);
        }
        else {
            callback({
                result:"no"
            })
        }
    }

    function notifyError(str) {
        notifyEvent({level:"error", message:str});
    }

    function notifyEvent(str) {
        if(typeof(str) === String ) {
            str = {
                id_client:getIdClient(),
                level:"event",
                message:str
            };
        }
        console.log("notifyEvent: event->server: "+str);
    }

    return{
        init: init,
        createSession: createSession,
        checkSession: checkSession,
        notifyError: notifyError,
        notifyEvent: notifyEvent
    };
});