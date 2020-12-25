const fetch = require('node-fetch');
const FileType = require('file-type');
const fs = require('fs');

const API_URL = 'https://api.sketchfab.com/v3';
const assetsPath = 'webserver/static/library/assets/';

class SketchfabUtils {
    async downloadAndSave(uid, sketchfabAPIToken, successCallback, errorCallback) {
        try {
            let modelInfo = await this._fetchModelInfo(uid);
            let downloadLink = await this._fetchDownloadLink(uid, sketchfabAPIToken);
            let model = await this._fetchModel(downloadLink);
            let smallPreviewImage = await this._fetchSmallPreviewImage(modelInfo);
            let mediumPreviewImage = await this._fetchMediumPreviewImage(modelInfo);
            let filenames = this._saveAssets(uid, model, smallPreviewImage, mediumPreviewImage);
            successCallback(modelInfo, filenames);
        } catch(err) {
            //TODO: Figure out if rate limit and send that information in the errorCallback if so
            //console.log(err);
            errorCallback();
        }
    }

    async _fetchModelInfo(uid) {
        let response = await fetch(API_URL + '/models/' + uid);
        let json = await response.json();
        return json;
    }

    async _fetchDownloadLink(uid, sketchfabAPIToken) {
        let response = await fetch(API_URL + '/models/' + uid + '/download',
            { headers: { 'Authorization': 'Token ' + sketchfabAPIToken } });
        let json = await response.json();
        return json.gltf.url;
    }

    async _fetchModel(downloadLink) {
        let response = await fetch(downloadLink);
        let arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }

    async _fetchSmallPreviewImage(modelInfo) {
        let url = await this._getPreviewUrl(modelInfo, 405, 720);
        let response = await fetch(url);
        let arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }

    async _fetchMediumPreviewImage(modelInfo) {
        let url = await this._getPreviewUrl(modelInfo, 576, 1024);
        let response = await fetch(url);
        let arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }

    async _getPreviewUrl(modelInfo, maxHeight, maxWidth) {
        let images = modelInfo.thumbnails.images;
        for(let i = 0; i < images.length; i++) {
            if(images[i].height <= maxHeight && images[i].width <= maxWidth) {
                return images[i].url;
            }
        }
        if(images.length > 0) {
            return images[images.length-1].url;
        }
        return null;
    }

    async _saveAssets(uid, model, smallPreviewImage, mediumPreviewImage) {
        let smallFileType = await FileType.fromBuffer(smallPreviewImage);
        let mediumFileType = await FileType.fromBuffer(mediumPreviewImage);

        let modelFilename = `${uid}.zip`;
        let smallImageFilename = `${uid}-small.${smallFileType.ext}`;
        let mediumImageFilename = `${uid}-medium.${mediumFileType.ext}`;

        this._saveAsset(modelFilename, model);
        this._saveAsset(smallImageFilename, smallPreviewImage);
        this._saveAsset(mediumImageFilename, mediumPreviewImage);
        return [modelFilename, smallImageFilename, mediumImageFilename];
        
    }

    _saveAsset(filename, arrayBuffer) {
        let buffer = Buffer.from(arrayBuffer);
        fs.createWriteStream(assetsPath + filename).write(buffer);
    }

}

let sketchfabUtils = new SketchfabUtils();

module.exports = sketchfabUtils;
