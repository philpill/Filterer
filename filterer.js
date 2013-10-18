define(function(require) {

    var $ = require('jquery');

    $.fn.filterer = function(options) {

        var mock = ['alpha', 'bravo', 'charlie', 'delta', 'echo'];

        var filterer = {

            defaults: { },
            init: function($el, options) {

                this.$el = $el;

                this.settings = $.extend(this.defaults, options);

                this.hideOriginalElement();

                this.createElements();

                this.attachElements();

                this.bindEvents();

                return this.$el;
            },
            hideOriginalElement: function() {

                this.$el.hide();
            },
            attachElements: function() {

                this.controls.$container.append(this.controls.$input);

                this.controls.$container.append(this.controls.$resultsContainer);

                this.controls.$resultsContainer.append(this.controls.$results);

                this.controls.$container.append(this.controls.$clear);

                this.$el.after(this.controls.$container);
            },
            createElements: function() {

                this.controls = {};

                this.controls.$container = $('<section class="filterer"></section>');

                this.controls.$input = $('<input />');

                this.controls.$resultsContainer = $('<div></div>');

                this.controls.$results = $('<ul></ul>');

                this.controls.$clear = $('<a></a>');
            },
            bindEvents: function() {

                var $container = this.controls.$container;

                $container.on('click', function(e) { e.stopPropagation(); });

                $container.on('keyup', this.controls.$input, this.onInputKeyUp.bind(this));

                $container.on('focusin', this.controls.$input, this.onInputFocusIn.bind(this));
            
                $container.on('click', $('li', this.controls.$results), this.onResultClick.bind(this));
            },
            onResultClick: function(e) {

                console.log('onResultClick()');

                var $target = $(e.target);

                console.log($target.text());

                if (this.settings.onResultSelect) {
                    
                    this.settings.onResultSelect();
                }
            },
            onInputFocusIn: function(e) {

                console.log('onInputFocus()');

                var query = $(e.target).val();

                console.log(query);

                if (query.length > 0) {

                    this.performSearch(query);
                }
            },
            onInputKeyUp: function(e) {

                console.log('onKeyUp()');

                var query = this.controls.$input.val();

                this.performSearch(query);
            },
            performSearch: function(query) {
                
                $.when(this.getResults(query))
                .then(this.populateList.bind(this))
                .then(this.displayList.bind(this));
            },
            getResults: function(query) {

                console.log('getResults()');

                console.log(query);

                var dfd = new $.Deferred();

                $.ajax('/temp/', { query: query })
                .done(function(data) {
                    dfd.resolve(data);
                })
                .fail(function() {
                    dfd.resolve(mock);
                });

                return dfd;
            },
            populateList: function(data) {

                console.log('populateList');

                console.log(data);

                var i = 0, $list = this.controls.$results;

                $list.empty();

                for (i=0,l=data.length;i<l;i++) {

                    $list.append('<li>' + data[i] + '</li>');
                }
            },
            displayList: function() {

                console.log('displayList()');

                if (!this.controls.$resultsContainer.hasClass('active')) {

                    this.controls.$resultsContainer.addClass('active');

                    $('body').one('click', this.hideList.bind(this));
                }
            },
            hideList: function() {

                console.log('hideList()');

                this.controls.$resultsContainer.removeClass('active');
            }
        }

        return filterer.init(this, options);
    };

});
