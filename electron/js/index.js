const { shell } = require('electron')
let activeUser;
let jwt;
let networkUrl;

$("#create-account-card").click(function() {
    $("#accounts-div").addClass("hidden");
    $("#create-account-div").removeClass("hidden");
});

$(".back-button").click(function() {
    $("#login-div").addClass("hidden");
    $("#account-div").addClass("hidden");
    $("#create-account-div").addClass("hidden");
    $("#accounts-div").removeClass("hidden");

    $("#sketchfab-update-error").addClass("hidden");
    $("#sketchfab-update-success").addClass("hidden");
});

$("#password-protected").change(function() {
    if(this.checked) {
        $("#password-row").removeClass("hidden");
    } else {
        $("#password-row").addClass("hidden");
    }
});

$("#password").keypress(function(e) {
    if(e.code == "Enter") {
        $("#create-account-submit").click();
    }
});

$("#create-account-submit").click(function() {
    let name = $("#name").val();
    let ageGroup = $("#age-group").val();
    let isPasswordProtected = $("#password-protected")[0].checked;
    let password = $("#password").val();
    let request = {
        'name': name,
        'ageGroup': ageGroup,
        'isPasswordProtected': isPasswordProtected,
        'password': password,
    };
    $("#create-account-error").addClass("hidden");
    $.ajax({
        url: API_URL + '/user',
        data: JSON.stringify(request),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            if(response.data) {
                addAccountToPage(response.data.user);
                activeUser = response.data.user;
                jwt = response.data.jwt;
                $("#user-name").text(activeUser.name);
                $("#sketchfab-api-token").val(activeUser.sketchfabAPIToken);
                $("#create-account-div").addClass("hidden");
                $("#account-div").removeClass("hidden");
            } else {
                $("#create-account-error").removeClass("hidden");
            }
        },
        error: function(xhr, status, error) {
            $("#create-account-error").removeClass("hidden");
        }
    });
});

$('input[type=radio][name=connection]').change(function() {
    if (this.value == 'local') {
        $("#local-start-div").removeClass("hidden");
        $("#network-start-div").addClass("hidden");
    } else if (this.value == 'network') {
        $("#local-start-div").addClass("hidden");
        $("#network-start-div").removeClass("hidden");
    }
    $("#network-address-error").addClass("hidden");
    $.ajax({
        url: API_URL + '/network-address',
        type: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            if(response.data) {
                $("#network-start-instructions").text("Go to " + response.data + " on your external device's web browser to get started");
            } else {
                $("#network-start-instructions").text("Please make sure you are connected to your network");
            }
        },
        error: function(xhr, status, error) {
            console.log(error);
            $("#network-address-error").removeClass("hidden");
        }
    });
});

$("#login-button").click(function() {
    login(activeUser._id, $("#login-password").val());
});

$("#login-password").keypress(function(e) {
    if(e.code == "Enter") {
        $("#login-button").click();
        //login(activeUser._id, $("#login-password").val());
    }
});

$("#start-button").click(function() {
    if(navigator.onLine) {
        shell.openExternal('https://app.thegateway.link?type=local');
    } else {
        shell.openExternal('http://127.0.0.1:3100?type=local');
    }
});

$("#update-sketchfab-button").click(function() {
    $("#sketchfab-update-success").addClass("hidden");
    $("#sketchfab-update-error").addClass("hidden");
    let token = $("#sketchfab-api-token").val();
    $.ajax({
        url: API_URL + '/user/sketchfab',
        data: JSON.stringify({ userId: activeUser._id, apiToken: token }),
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        success: function(response) {
            $("#sketchfab-update-success").removeClass("hidden");
        },
        error: function(xhr, status, error) {
            $("#sketchfab-update-error").removeClass("hidden");
        }
    });
});

$("#delete-account-button").click(function() {
    $("#account-div").addClass("hidden");
    $("#confirm-delete-div").removeClass("hidden");
});

$("#cancel-delete-account-button").click(function() {
    $("#confirm-delete-div").addClass("hidden");
    $("#account-div").removeClass("hidden");

    $("#delete-error").addClass("hidden");
});

$("#confirm-delete-account-button").click(function() {
    $.ajax({
        url: API_URL + '/user',
        data: JSON.stringify({ id: activeUser._id }),
        type: 'DELETE',
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        success: function(response) {
            window.location.reload();
        },
        error: function(xhr, status, error) {
            $("#delete-error").removeClass("hidden");
        }
    });
});

function addAccountToPage(user) {
    let div = document.createElement("div");
    let p = document.createElement("p");
    p.textContent = user.name;
    p.account = user;
    $(div).addClass("account-card");
    div.appendChild(p);
    $("#account-cards")[0].appendChild(div);
    $(div).click(() => {
        activeUser = user;
        $("#user-name").text(user.name);
        if(user.isPasswordProtected) {
            $("#accounts-div").addClass("hidden");
            $("#login-div").removeClass("hidden");
        } else {
            login(user._id, null);
        }
    });
}

function login(id, password) {
    let request = { 'id': id, 'password': password };
    $("#login-error").addClass("hidden");
    $.ajax({
        url: API_URL + '/login',
        data: JSON.stringify(request),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            jwt = response.data.jwt;
            activeUser = response.data.user;
            $("#login-div").addClass("hidden");
            $("#accounts-div").addClass("hidden");
            $("#account-div").removeClass("hidden");
            $("#login-password").val("");
            $("#sketchfab-api-token").val(activeUser.sketchfabAPIToken);
        },
        error: function(xhr, status, error) {
            $("#login-error").removeClass("hidden");
        }
    });
}

function init() {
    $.ajax({
        url: API_URL + '/users',
        type: 'GET',
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            let users = response.data;
            for(let i = 0; i < users.length; i++) {
                addAccountToPage(users[i]);
            }
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    });
}

init();
