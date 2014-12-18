var fb = null;

var lastEvent = -1;
var currentEvent = -1;

function htmlEncode(value) {
    return $('<div>').text(value).html();
}

function htmlDecode(value) {
    return $('<div>').html(value).text();
}

function balert(type, title, message) {
    var alertObj = $('#adv-alert');
    var newAlertObj = $('<div id="adv-alert" class="alert alert-' + type + ' alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times</span><span class="sr-only">Close</span></button>' + (title && title != '' ? '<strong>' + title + '</strong>' : '') + (message ? ' ' + message : '') + '</div>');
    newAlertObj.hide();
    if (alertObj.length) {
        alertObj.on('closed.bs.alert', function () {
            newAlertObj.prependTo('#adv-alert-div').show();
        });
        alertObj.alert('close');
    } else {
        newAlertObj.prependTo('#adv-alert-div').show();
    }
}

function loadEvent(event, id) {
    $('#adv-event-scenario').text(event['scenario']);
    var options = event['options'];
    var optionsDiv = $('#adv-event-options');
    optionsDiv.empty();
    if (options) {
        for (var key in options) {
            var option = options[key];
            if (!option['deleted']) {
                optionsDiv.append('<a href="#' + encodeURIComponent(option['eventid']) + '" class="list-group-item adv-event-option">' + htmlEncode(option['option']) + '</a>');
            }
        }
    }

    if (currentEvent != id) {
        lastEvent = currentEvent;
        currentEvent = id;
    }
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

function onChangeHash() {
    var id = location.hash == '' ? '0' : decodeURIComponent(location.hash.slice(1));
    loadEventById(id);
}

$(document).ready(function () {
    fb = new Firebase('https://cariena.firebaseio.com');

    $('#adv-back').click(function (e) {
        history.go(-1);
    });

    $('#adv-refresh').click(function(e) {
        loadEventById(currentEvent);
        balert('success', 'Page refreshed!');
    });

    $('#adv-popup-login-register').click(function(e) {
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

    $('#adv-popup-login-submit').click(function(e) {
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

    $('#adv-login-logout').click(function(e) {
        fb.unauth();
        balert('warning', '', 'You have successfully logged out');
        $('.adv-login').hide();
        $('.adv-logout').show();
    });

    $('#adv-popup-login').on('shown.bs.modal', function() {
        $('#adv-popup-login-email').focus();
    });

    $('#adv-popup-login-email').on("keypress", function(e) {
        if (e.keyCode == 13) {
            $('#adv-popup-login-pass').focus();
            return false;
        }
    });

    $('#adv-popup-login-pass').on("keypress", function(e) {
        if (e.keyCode == 13) {
            $('#adv-popup-login-submit').click();
            return false;
        }
    });

    $('#adv-edit-button').change(function() {
        if($(this).prop('checked')) {
            $('.adv-edit').show();
            $('#adv-edit-add-option').focus();
        } else {
            $('.adv-edit').hide();
        }
    });

    $('#adv-edit-add-option').on("keypress", function(e) {
        if (e.keyCode == 13) {
            $('#adv-edit-add-scenario').focus();
            return false;
        }
    });

    $('#adv-edit-add-scenario').on("keypress", function(e) {
        if (e.keyCode == 13) {
            $('#adv-edit-add-submit').click();
            return false;
        }
    });

    $('#adv-edit-add-submit').click(function(e) {
        var option = $('#adv-edit-add-option').val().trim();
        var scenario = $('#adv-edit-add-scenario').val().trim();
        if (option == '') {

        } else if (scenario == '') {

        } else {
            var ref = fb.child('events').push({
                'ownerid': fb.getAuth().uid,
                'scenario': scenario
            }, function (error) {
                if (error) {
                    balert('danger', 'Error!', error.message);
                    $('#adv-edit-add-option').val('');
                    $('#adv-edit-add-scenario').val('');
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
                        $('#adv-edit-add-option').val('');
                        $('#adv-edit-add-scenario').val('');
                    });
                }
            });
        }
    });

    $(window).on('hashchange', onChangeHash);

    $('#adv-event-loading-hidden, .adv-login, .adv-edit').hide();

    if (fb.getAuth()) {
        $('.adv-logout').hide();
        $('.adv-login').show();
    }

    onChangeHash();
});