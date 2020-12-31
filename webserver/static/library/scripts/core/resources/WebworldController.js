import AssetTypes from '/library/scripts/core/enums/AssetTypes.js';
import ModelTypes from '/library/scripts/core/enums/ModelTypes.js';
import global from '/library/scripts/core/resources/global.js';
import { zipToGLTF, fullDispose } from '/library/scripts/core/resources/utils.module.js';
import * as THREE from '/library/scripts/three/build/three.module.js';

class WebworldController {
    constructor() {
        this._pivotPoint = new THREE.Object3D();
        this._webworld;
        this._assetsMap = {};
        this._gltfMap = {};
    }

    setWebworld(webworld) {
        this.clearWebworld();
        this._webworld = webworld;
        console.log("TODO: add assets for webworld");
        global.activeWebworld = webworld._id;
    }

    clearWebworld() {
        global.activeWebworld = null;
        console.log("TODO: clear current webworld assets");
    }

    addAsset(asset, successCallback, errorCallback) {
        if(asset.type == AssetTypes.MODEL) {
            if(asset.modelType == ModelTypes.GLTF) {
                this._addGLTF(asset, successCallback, errorCallback);
            } else {
                //TODO: Handle other model types
                errorCallback();
            }
        } else {
            //TODO: Handle other asset types
            errorCallback();
        }
    }

    _addGLTF(asset, successCallback, errorCallback) {
        if(asset._id in this._gltfMap) {
            console.log("TODO: Clone GLTF");
            errorCallback();//Just to reset the button in the meantime
            return;
        }
        fetch(asset.filepath).then((response) => {
            return response.arrayBuffer();
        }).then((arrayBuffer) => {
            zipToGLTF(arrayBuffer,
                (gltf) => {
                    this._handleAddSuccess(asset, gltf);
                    successCallback(); },
                () => errorCallback());
        });
    }

    _handleAddSuccess(asset, gltf) {
        this._gltfMap[asset._id] = gltf;
        this._pivotPoint.add(gltf.scene);
        console.log("TODO: add asset data to Webworld");
        //TODO: add asset data to Webworld. Will need to have an id for each
        //      instance. Will also need a name, position, and rotation
    }

    addToScene(scene) {
        scene.add(this._pivotPoint);
    }

    removeFromScene() {
        this._pivotPoint.parent.remove(this._pivotPoint);
        fullDispose(this._pivotPoint);
        //TODO: See if we need to clear any textures from memory as well?
    }
}

let webworldController = new WebworldController();

export default webworldController;
