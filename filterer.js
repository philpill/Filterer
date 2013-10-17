define(function(require) {

    var $ = require('jquery');

    $.fn.filterer = function(options) {

        var filterer = {

            defaults: { },
            init: function($el, options) {
                
                this.$el = $el;

                this.settings = $.extend(this.defaults, options);

                this.createElements();

                this.attachElements();

                return this.$el;
            },
            attachElements: function() {

                this.controls.$container.append(this.controls.$input);
                
                this.controls.$container.append(this.controls.$results);

                this.controls.$container.append(this.controls.$clear);

                this.$el.after(this.controls.$container);
            },
            createElements: function() {

                this.controls = {};

                this.controls.$container = $('<section class="filterer"></section>');

                this.controls.$input = $('<input />');

                this.controls.$results = $('<div><ul></ul></div>');

                this.controls.$clear = $('<a></a>');
            },
            bindEvents: function() {
            
                var $el = this.$el;
    
                $el.on('keyup', this.onKeyUp);
            },
            onKeyUp: function(e) {

                //make ajax request

                //populate dropdown

                //display dropdown
            }
        }

        return filterer.init(this, options);
    };

});
