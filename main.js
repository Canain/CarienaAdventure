var fb = null;

var lastEvent = -1;
var currentEvent = -1;

function loadEvent(event, id) {
    $('#adv-event-scenario').text(event['scenario']);
    var options = event['options'];
    var optionsDiv = $('#adv-event-options');
    optionsDiv.empty();
    if (options) {
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            optionsDiv.append('<a href="#" data-eventid="' + option['eventid'] + '" class="list-group-item adv-event-option">' + option['option'] + '</a>');
        }
    }

    lastEvent = currentEvent;
    currentEvent = id;

    $('.adv-event-option').click(function (e) {
        var target = $(e.target);
        loadEventById(target.data('eventid'));
        e.preventDefault();
    });
}

function loadEventById(id) {
    var showLoading = currentEvent == -1;
    if (showLoading) {
        var loading = $('#adv-event-loading');
        var loadingHidden = $('#adv-event-loading-hidden');
        loading.show();
        loadingHidden.hide();
    }
    fb.child('events/' + id).once('value', function (data) {
        var info = data.val();

        if (info) {
            loadEvent(info, id);
        }
        if (showLoading) {
            loading.hide();
            loadingHidden.show();
        }
    }, function (error) {
        if (showLoading) {
            loading.hide();
            loadingHidden.show();
        }
        popup('Error', error.message);
    });
}

function popup(title, message) {
    $('#adv-popup-title').text(title);
    $('#adv-popup-message').text(message);
    $('#adv-popup').modal('show');
}

$(document).ready(function () {
    fb = new Firebase('https://cariena.firebaseio.com');

    $('#adv-back').click(function (e) {
        if (lastEvent > -1) {
            loadEventById(lastEvent);
        }
    });

    loadEventById(0);
});