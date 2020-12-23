import global from '/library/scripts/core/resources/global.js';

const API_URL = 'https://api.sketchfab.com/v3';

class SketchfabAPI {
    constructor() {
    }

    search(query, successCallback, errorCallback) {
        $.ajax({
            url: API_URL + '/search?type=models&downloadable=true&q=' + encodeURI(query),
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

let sketchfabAPI = new SketchfabAPI();

export default sketchfabAPI;
