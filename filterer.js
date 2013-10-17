define(function(require) {

    var $ = require('jquery');

    $.fn.filterer = function(options) {


        var settings = $.extend({

        }, options);


        return this;
    };

});
