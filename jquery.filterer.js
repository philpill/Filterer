define(function(require) {

    var $ = require('jquery');

    $.fn.filterer = function(options) {

        /** ------- ---- */
        /** Private area */
        /** ------- ---- */

        var controls, settings,

        $this = this,

        defaults = {

            getUrl: '',
            applySearchParameters: $.noop,
            onResultSelect: $.noop

        },

        /**
         * Generate plugin elements - returns object containing constituent parts
         * @return {Object}
         * @private
         */
        getControls = function () {

            var controls = {};
            controls.$container = $('<section class="filterer"></section>');
            controls.$input = $('<input />');
            controls.$resultsContainer = $('<div></div>');
            controls.$results = $('<ul></ul>');
            return controls;
        },

        /**
         * Assemble given controls
         * @param {Object} controls Object containing separate jQuery element objects
         * @return {Object}
         * @private
         */
        assembleControls = function(controls) {

            controls.$container.append(controls.$input);
            controls.$container.append(controls.$resultsContainer);
            controls.$resultsContainer.append(controls.$results);
            $this.after(controls.$container);
            return controls;
        },

        /**
         * Copy required attributes from original element
         * @private
         */
        mirrorAttributes = function() {

            controls.$input.attr('placeholder', $this.attr('placeholder'));
        },

        /**
         * Hide original element from view
         * @private
         */
        hideOriginalElement = function() {

            $this.hide();
        },

        /**
         * Hide list of search results, if displayed
         * @private
         */
        hideList = function() {

            if (controls.$resultsContainer.hasClass('active')) {
                controls.$resultsContainer.removeClass('active');
            }
        },

        /**
         * Reset plugin UI
         * @private
         */
        reset = function() {

            //highlightSearchField();
            hideList();
            controls.$results.empty();
            controls.$input.val('');
        },

        /**
         * Unhide search results list and bind event to hide again on body click
         * @private
         */
        displayList = function() {

            if (!controls.$resultsContainer.hasClass('active')) {
                controls.$resultsContainer.addClass('active');
                $('body').one('click', hideList);
            }
        },

        /**
         * Generate markup for search results and append to results list
         * @param {Object} data Search results
         * @return {jQuery}
         * @private
         */
        populateList = function(data) {

            var i = 0, $list = controls.$results, $item;
            $list.empty();
            for (i=0,l=data.length;i<l;i++) {
                $item = $('<li></li>');
                $item.attr('data-value',data[i].value);
                $item.attr('data-location',data[i].location);
                $item.text(data[i].label);
                $list.append($item);
            }
            return $list;
        },

        /**
         * Make search request using given parameters
         * @param {Object} query Search parameters
         * @return {jQuery.deferred}
         * @private
         */
        getResults = function(query) {
            var dfd = new $.Deferred();
            $.ajax({
                url: settings.getUrl,
                type: "GET",
                data: decodeURIComponent($.param(query))
            })
            .done(dfd.resolve);
            return dfd;
        },

        /**
         * Gather parameters, call search function and handle results
         * @param {Object} query Search parameters
         * @return {jQuery.deferred}
         * @private
         */
        performSearch = function(query) {

            $.when(getResults(query))
            .then(populateList)
            .then(displayList)
            .then(activateFirstResult);
        },

        /**
         * Call performSearch() passing search input value as argument
         * @return {jQuery}
         * @private
         */
        performSearchWithInput = function() {

            performSearch(getSearchParameters());
        },

        /**
         * Get first active element
         * @return {jQuery}
         * @private
         */
        getActiveResult = function() {

            return controls.$results.find('.active').first();
        },

        /**
         * Add active class to first list item in results list
         * @private
         */
        activateFirstResult = function() {

            var $firstResult = controls.$results.find('li').first();
            activateResult($firstResult);
        },

        /**
         * Activate list item currently being hovered over
         * @param {jQuery.Event} e
         * @private
         */
        onResultMouseEnter = function(e) {

            activateResult($(e.currentTarget));
        },

        /**
         * Handle result selection and update results list
         * @param {jQuery.Event} e
         * @return {jQuery.deferred}
         * @private
         */
        onResultClick = function(e) {

            e.preventDefault();
            settings.onResultSelect($(e.currentTarget).data('value'));
            highlightSearchField();
        },

        /**
         * Get combined search arguments from text input and plugin options
         * @return {Object}
         * @private
         */
        getSearchParameters = function() {

            return $.extend({ query: controls.$input.val() }, settings.applySearchParameters());
        },

        /**
         * Request search on input focus, if value exists in field
         * @param {jQuery.Event} e
         * @private
         */
        onInputFocusIn = function(e) {

            if ($(e.target).val().length > 0) {
                performSearch(getSearchParameters());
            }
        },

        /**
         * Add active option to table
         * @private
         */
        selectActiveResult = function() {

            var activeResult = getActiveResult();
            selectResult(activeResult.data('value'));
        },

        /**
         * Set previous search result option active, if present
         * @private
         */
        activatePreviousResult = function () {

            var $activeResult = getActiveResult(),
                $prev = $activeResult.prev();

            activateResult($prev);
        },

        /**
         * Set next search result option active, if present
         * @private
         */
        activateNextResult = function () {

            var $activeResult = getActiveResult(),
                $next = $activeResult.next();

            activateResult($next);
        },

        /**
         * Activate given search result option, deactivate others
         * @param {jQuery} $result Search result option to set active
         * @private
         */
        activateResult = function ($result) {

            if ($result.length) {
                deactivateResults();
                $result.addClass('active');
            }
        },

        /**
         * Deactivate all search results
         * @private
         */
        deactivateResults = function () {

            controls.$results.find('li').removeClass('active');
        },

        /**
         * Apply optional handler to search result value
         * @param {String} value Search option ID
         * @private
         */
        selectResult = function (value) {

            settings.onResultSelect(value);
        },

        /**
         * Selects the text in the search field and implicitly performs search
         * @private
         */
        highlightSearchField = function () {

            controls.$input.select();
        },

        /**
         * Call search function on entering a value into input field, plus keyboard navigation
         * @param {jQuery.event} e Keyup event
         * @private
         */
        onInputKeyUp = function(e) {

            switch (e.which) {
                case 27: //escape
                    reset();
                    break;
                case 38: //up
                    activatePreviousResult();
                    e.preventDefault();
                    break;
                case 40: //down
                    activateNextResult();
                    e.preventDefault();
                    break;
                case 13: //enter
                    selectActiveResult();
                    performSearchWithInput();
                    highlightSearchField();
                    e.preventDefault();
                    break
                default:
                    performSearchWithInput();
                    break;
            }
        },

        /**
         * Attach handlers to events
         * @private
         */
        bindEvents = function() {

            var $container = controls.$container;
            $container.on('click', function(e) { e.stopPropagation(); });
            $container.on('keyup', controls.$input, onInputKeyUp);
            $container.on('focusin', controls.$input, onInputFocusIn);
            $container.on('click', function(e) { e.preventDefault(); });
            $container.on('click', 'li', onResultClick);
            $container.on('mouseenter', 'li', onResultMouseEnter);
        },

        /**
         * Initialise plugin - replace original element and bind events (self invoking)
         * @param {Object} options Plugin configuration
         * @private
         */
        init = (function(options) {

            settings = $.extend(defaults, options);
            hideOriginalElement();
            controls = assembleControls(getControls());
            mirrorAttributes();
            bindEvents();

        })(options);

        /** ------ ---- */
        /** Public area */
        /** ------ ---- */

        return {

            reset : reset
        };
    };
});