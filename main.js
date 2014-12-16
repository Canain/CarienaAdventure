var fb = null;

var lastEvent = -1;
var currentEvent = -1;

function loadEvent(event, id) {
    $('#adv-event-scenario').text(event['scenario']);
    var options = event['options'];
    var optionsDiv = $('#adv-event-options');
    optionsDiv.empty();
    if (options) {
        for (var key in options) {
            var option = options[key];
            if (!option['deleted']) {
                optionsDiv.append('<a href="#" data-eventid="' + option['eventid'] + '" class="list-group-item adv-event-option">' + option['option'] + '</a>');
            }
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
        balert('danger', 'Error!', error.message);
    });
}

function balert(type, title, message) {
    $('#adv-alert-div').prepend('<div class="alert alert-' + type + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times</span><span class="sr-only">Close</span></button> <strong>' + title + '</strong>' + (message ? ' ' + message : '') + '</div>');
}

$(document).ready(function () {
    fb = new Firebase('https://cariena.firebaseio.com');

    $('#adv-back').click(function (e) {
        if (lastEvent > -1) {
            loadEventById(lastEvent);
        }
    });

    $('#adv-popup-login-register').click(function (e) {
        fb.createUser({
            'email' : $('#adv-popup-login-email').val(),
            'password' : $('#adv-popup-login-pass').val()
        }, function(error) {
            if (error) {
                balert('danger', 'Error!', error.message);
            } else {
                balert('success', 'Registration success!', 'Login to continue');
            }
            $('#adv-popup-login').modal('hide');
        });
    });

    $('#adv-popup-login-submit').click(function (e) {
        fb.authWithPassword({
            'email' : $('#adv-popup-login-email').val(),
            'password' : $('#adv-popup-login-pass').val()
        }, function(error, authData) {
            if (error) {
                balert('danger', 'Error!', error.message);
            } else {
                balert('success', 'Login success!');
                $('.adv-logout').hide();
                $('.adv-login').show();
            }
            $('#adv-popup-login').modal('hide');
        });
    });

    $('#adv-login-logout').click(function (e) {
        fb.unauth();
        balert('warning', 'Logged out!', 'You have successfully logged out');
        $('.adv-login').hide();
        $('.adv-logout').show();
    });

    $('#adv-popup-login-pass').on("keypress", function(e) {
        if (e.keyCode == 13) {
            $('#adv-popup-login-submit').click();
            return false;
        }
    });

    $('#adv-popup-add-scenario').on("keypress", function(e) {
        if (e.keyCode == 13) {
            $('#adv-popup-add-submit').click();
            return false;
        }
    });

    $('#adv-popup-add-submit').click(function (e) {
        var option = $('#adv-popup-add-option').val().trim();
        var scenario = $('#adv-popup-add-scenario').val().trim();
        if (option == '') {

        } else if (scenario == '') {

        } else {
            var ref = fb.child('events').push({
                'ownerid': fb.getAuth().uid,
                'scenario': scenario
            }, function (error) {
                if (error) {
                    balert('danger', 'Error!', error.message);
                    $('#adv-popup-add').modal('hide');
                } else {
                    fb.child('events/' + currentEvent + '/options').push({
                        'ownerid': fb.getAuth().uid,
                        'option': option,
                        'eventid': ref.key(),
                        'deleted': false
                    }, function (error) {
                        if (error) {
                            balert('danger', 'Error!', error.message);
                        } else {
                            balert('success', 'Success!', 'The scenario has been added');
                            loadEventById(currentEvent);
                        }
                        $('#adv-popup-add').modal('hide');
                    });
                }
            });
        }
    });

    $('#adv-event-loading-hidden, .adv-login').hide();

    loadEventById(0);
});