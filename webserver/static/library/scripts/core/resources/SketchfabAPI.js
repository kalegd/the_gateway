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
}

let sketchfabAPI = new SketchfabAPI();

export default sketchfabAPI;
