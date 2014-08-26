(function() {
    require.config({
        paths: {
            jquery : '../vendors/jquery/jquery-1.11.1.min',
            swfobject: '../vendors/swfobject',

            flashModule: 'flashModule',
            flashApi: 'flashApi',
            api: 'FakeApi',
//            api: 'FakeApi',
//            api: 'HttpApi',
            clientView: 'clientView',
        },
        shim: {
            'jquery':{exports: '$'},
            'swfobject':{exports: 'swfobject'}
        }
    });

    require(['jquery', 'api', 'flashModule', 'clientView'], function($, api, flash, clientView) {

//        var session = "1"; // Client session: PROVIDED BY PHP SCRIPT from Server
        var session = "2"; // Actor session: PROVIDED BY PHP SCRIPT from Server

        var swf = 'assets/VideoChat.swf?'+Math.random();

        if(window.fakeIdClient) {                               // Для создания различных тестовых страниц нужно указывтаь fakeIdClient
            session = window.fakeIdClient;
            swf = '../assets/VideoChat.swf?'+Math.random();
        }

        /////////////////////////////////////

        api.init(session);
        clientView.init();
        flash.init(swf,'VideoChat');

        /////////////////////////////////////

    });
})();
