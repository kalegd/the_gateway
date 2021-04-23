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

    deleteAsset(params) {
        let request = params.data || {};
        let successCallback = params.success || (() => {});
        let errorCallback = params.error || (() => {});
        $.ajax({
            url: global.API_URL + '/user/asset',
            type: 'DELETE',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                let libraryAssets = global.user.library.assets;
                for(let i = 0; i < libraryAssets.length; i++) {
                    if(libraryAssets[i].assetId == request.assetId) {
                        libraryAssets.splice(i,1);
                        break;
                    }
                }
                delete global.userAssetsMap[request.assetId];
                for(let webworldId in global.webworldsMap) {
                    let webworldAssets = global.webworldsMap[webworldId].assets;
                    delete webworldAssets[request.assetId];
                }
                WebworldController.deleteAsset(request.assetId);
                successCallback(response);
            },
            error: (xhr, status, error) => {
                errorCallback(xhr, status, error);
            }
        });
    }
}

let backendAPI = new BackendAPI();

export default backendAPI;
