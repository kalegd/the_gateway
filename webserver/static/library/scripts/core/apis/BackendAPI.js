import global from '/library/scripts/core/resources/global.js';
import WebworldController from '/library/scripts/core/resources/WebworldController.js';

class BackendAPI {
    constructor() {
    }

    createWebworld(params) {
        let request = params.data || {};
        let successCallback = params.success || (() => {});
        let errorCallback = params.error || (() => {});
        $.ajax({
            url: global.API_URL + '/user/webworld',
            type: 'POST',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                global.user.webworlds.push(response.data._id);
                global.webworldsMap[response.data._id] = response.data;
                if(global.user.webworlds.length == 1) {
                    global.user.defaultWebworld = response.data._id;
                }
                WebworldController.setWebworld(response.data);
                successCallback(response);
            },
            error: (xhr, status, error) => {
                errorCallback(xhr, status, error);
            }
        });
    }

    searchFrom(query, fromIndex, successCallback, errorCallback) {
        $.ajax({
            url: API_URL + '/search?type=models&downloadable=true&q=' + encodeURI(query) + '&cursor=' + fromIndex,
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                successCallback(response);
            },
            error: (xhr, status, error) => {
                errorCallback();
            }
        });
    }

    download(uid, successCallback, errorCallback) {
        let authHeader = {
            'Authorization': 'Token ' + global.user.sketchfabAPIToken
        };
        $.ajax({
            url: API_URL + '/models/' + uid + '/download',
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            headers: authHeader,
            success: (response) => {
                fetch(response.gltf.url).then((response) => {
                    return response.arrayBuffer()
                }).then((data) => {
                    successCallback(data);
                }).catch((error) => {
                    console.error(error);
                    errorCallback();
                })
            },
            error: (xhr, status, error) => {
                errorCallback();
            }
        });
    }
}

let backendAPI = new BackendAPI();

export default backendAPI;
