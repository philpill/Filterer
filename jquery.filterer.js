define(function(require) {

    var $ = require('jquery');

    $.fn.filterer = function(options) {

        var mock = [

            {'label': 'label-a', 'value': 1, 'location': 'location-a'},
            {'label': 'label-b', 'value': 2, 'location': 'location-b'},
            {'label': 'label-c', 'value': 3, 'location': 'location-c'},
            {'label': 'label-d', 'value': 4, 'location': 'location-d'},
            {'label': 'label-e', 'value': 5, 'location': 'location-e'},
            {'label': 'label-f', 'value': 6, 'location': 'location-f'},
            {'label': 'label-g', 'value': 7, 'location': 'location-g'},
            {'label': 'label-h', 'value': 8, 'location': 'location-h'},
            {'label': 'label-i', 'value': 9, 'location': 'location-i'},
            {'label': 'label-j', 'value': 10, 'location': 'location-j'}
        ];

        var filterer = (function(options) {

            return {

                defaults: {

                    getUrl: '',
                    saveUrl: ''
                },
                init: function($el) {

                    this.$el = $el;

                    this.settings = $.extend(this.defaults, options);

                    this.hideOriginalElement();

                    this.controls = this.assembleControls(this.getControls());

                    this.mirrorAttributes();

                    this.bindEvents();

                    return this;
                },
                hideOriginalElement: function() {

                    this.$el.hide();
                },
                assembleControls: function(controls) {

                    controls.$container.append(controls.$input);

                    controls.$container.append(controls.$resultsContainer);

                    controls.$resultsContainer.append(controls.$results);

                    this.$el.after(controls.$container);

                    return controls;
                },
                getControls: function() {

                    var controls = {};

                    controls.$container = $('<section class="filterer"></section>');

                    controls.$input = $('<input />');

                    controls.$resultsContainer = $('<div></div>');

                    controls.$results = $('<ul></ul>');

                    return controls;
                },
                mirrorAttributes: function() {

                    this.controls.$input.attr('placeholder', this.$el.attr('placeholder'))
                },
                bindEvents: function() {

                    var $container = this.controls.$container;

                    $container.on('click', function(e) { e.stopPropagation(); });

                    $container.on('keyup', this.controls.$input, this.onInputKeyUp.bind(this));

                    $container.on('focusin', this.controls.$input, this.onInputFocusIn.bind(this));

                    $container.on('click', 'li', this.onResultClick.bind(this));
                },
                reset: function() {

                    this.controls.$input.val('');

                    this.controls.$results.empty();
                },
                onResultClick: function(e) {

                    e.stopImmediatePropagation();

                    console.log('onResultClick()');

                    var $currentTarget = $(e.currentTarget);

                    console.log($currentTarget.text());

                    if (this.settings.onResultSelect) {

                        this.settings.onResultSelect($currentTarget.data('value'));
                    }

                    this.hideList();

                    this.reset();
                },
                onInputFocusIn: function(e) {

                    console.log('onInputFocus()');

                    var query = $(e.target).val();

                    console.log(query);

                    if (query.length > 0) {

                        this.performSearch({ query: query });
                    }
                },
                onInputKeyUp: function(e) {

                    console.log('onKeyUp()');

                    var query = this.controls.$input.val();

                    this.performSearch({ query: query });
                },
                performSearch: function(query) {

                    console.log('performSearch()');

                    if (this.settings.applySearchParameters) {
                        query = $.extend(query, this.settings.applySearchParameters());
                    }

                    console.log(query);

                    $.when(this.getResults(query))
                    .then(this.populateList.bind(this))
                    .then(this.displayList.bind(this));
                },
                getResults: function(query) {

                    console.log('getResults()');

                    console.log(query);

                    var dfd = new $.Deferred();

                    $.ajax(this.settings.getUrl, { query: query })
                    .done(function(data) {
                        dfd.resolve(mock);
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

                        $list.append('<li data-value="' + data[i].value + '" data-location="' + data[i].location + '">' + data[i].label + '</li>');
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

                    if (this.controls.$resultsContainer.hasClass('active')) {

                        this.controls.$resultsContainer.removeClass('active');
                    }
                }
            };

        })(options);

        return filterer.init(this);
    };

});
