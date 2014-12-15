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
        popup('danger', 'Error!', error.message);
    });
}

function popup(type, title, message) {
    $('#adv-alert-div').append('<div class="alert alert-' + type + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times</span><span class="sr-only">Close</span></button> <strong>' + title + '</strong> ' + message + '</div>');
}

$(document).ready(function () {
    fb = new Firebase('https://cariena.firebaseio.com');

    $('#adv-back').click(function (e) {
        if (lastEvent > -1) {
            loadEventById(lastEvent);
        }
    });

    $('#adv-login-button').click(function (e) {

    });

    $('#adv-event-loading-hidden, .adv-login').hide();

    loadEventById(0);
});