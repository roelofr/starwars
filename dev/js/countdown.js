(function(doc, $) {
    'use strict';

    var countWith = null;
    var countTo = null;
    var canRefresh = true;

    /**
     * Gets the time from the <body> tag. It looks in a `data-showdate`
     * attribute
     * @private
     */
    var GetTime = function() {
        var dateString = $('body').data('showdate');
        if(dateString) {
            countTo = new Date(dateString);
        } else {
            countTo = new Date('2016-01-01T12:00:00+00:00');
        }
    };

    /**
     * Returns if the event has already happened.
     *
     * @return {Boolean} True if the thing has already happened
     */
    var isPast = function() {
        if(!countTo) {
            return true;
        }

        return (countTo.getTime() < new Date().getTime());
    };

    /**
     * Handles a page refresh, with throttling
     */
    var refresh = function() {
        if(!canRefresh || countTo === null) {
            return;
        }

        // Throttle new reloads
        canRefresh = false;

        // Reload, ignoring the Browsers cache
        document.location.reload(true);
    };

    /**
     * Handles updates of the countdown
     * @param {Event} event Event to handle
     */
    var update = function(event) {

        var format = [];

        if(event.offset.weeks > 0) {
            format.push('%-w %!w:week,weken;');
        }

        if(event.offset.daysToWeek > 0) {
            format.push('%-d dag%!d:en;');
        }

        format.push('%H:%M:%S');

        countWith.text(event.strftime(format.join(', ')));
    };

    /**
     * Handles initiation, including to detect if the countdown should start.
     *
     * @private
     */
    var init = function() {
        GetTime();

        // Stop if in the past
        if(isPast()) {
            console.log('it\'s past');
            return;
        }

        countWith = $("[data-content=countdown]").eq(0);

        if(countWith.length === 0) {
            countWith = $(".text-muted > span").eq(0);
        }

        if(countWith.length === 0) {
            return;
        }

        countWith.countdown(countTo)
            .on('finish.countdown', refresh)
            .on('update.countdown', update);
    };

    // Trigger init on DOM ready
    $(doc).ready(init);

}(document, jQuery));