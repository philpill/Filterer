require.config({

    paths: {
        jquery: [
            'jquery-2.0.3.min',
            '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min'
        ],
        filterer: 'filterer'
    },
    deps: ['jquery', 'filterer'],
    callback: function($, filterer) {

        $('input:first').filterer();
    }
});
