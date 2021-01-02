import AssetTypes from '/library/scripts/core/enums/AssetTypes.js';
import ModelTypes from '/library/scripts/core/enums/ModelTypes.js';
import global from '/library/scripts/core/resources/global.js';
import { zipToGLTF, uuidv4, fullDispose } from '/library/scripts/core/resources/utils.module.js';
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
        for(let assetId in this._webworld.assets) {
            let asset = global.assetsMap[assetId];
            fetch(asset.filepath).then((response) => {
                return response.arrayBuffer();
            }).then((arrayBuffer) => {
                zipToGLTF(arrayBuffer,
                    (gltf) => {
                        this._gltfMap[asset._id] = gltf;
                        for(let instance of webworld.assets[assetId]) {
                            this._addGLTFToScene(assetId, instance, gltf);
                        }
                    },
                    () => console.log("TODO: Notify user of error"))
            });
        }
    }

    clearWebworld() {
        global.activeWebworld = null;
        console.log("TODO: clear current webworld assets");
    }

    addAsset(asset, successCallback, errorCallback) {
        if(asset.type == AssetTypes.MODEL) {
            if(asset.modelType == ModelTypes.GLTF) {
                this._fetchGLTF(asset, successCallback, errorCallback);
            } else {
                //TODO: Handle other model types
                errorCallback();
            }
        } else {
            //TODO: Handle other asset types
            errorCallback();
        }
    }

    _fetchGLTF(asset, successCallback, errorCallback) {
        if(asset._id in this._gltfMap) {
            this._handleFetchGLTFSuccess(asset, this._gltfMap[asset._id]);
            successCallback();
            return;
        }
        fetch(asset.filepath).then((response) => {
            return response.arrayBuffer();
        }).then((arrayBuffer) => {
            zipToGLTF(arrayBuffer,
                (gltf) => {
                    this._handleFetchGLTFSuccess(asset, gltf);
                    successCallback(); },
                () => errorCallback());
        });
    }

    _handleFetchGLTFSuccess(asset, gltf) {
        this._gltfMap[asset._id] = gltf;
        let instance = {
            instanceId: uuidv4(),
            position: [0,0,0],
            rotation: [0,0,0],
            scale: [1,1,1],
        };
        this._addGLTFToScene(asset._id, instance, gltf);
        if(!(asset._id in this._webworld.assets)) {
            this._webworld.assets[asset._id] = [];
        }
        this._webworld.assets[asset._id].push(instance);
    }

    _addGLTFToScene(assetId, instance, gltf) {
        let assetInstance = gltf.scene.clone();
        assetInstance.position.fromArray(instance.position);
        assetInstance.rotation.fromArray(instance.rotation);
        assetInstance.scale.fromArray(instance.scale);
        this._pivotPoint.add(assetInstance);
        if(!(assetId in this._assetsMap)) {
            this._assetsMap[assetId] = {};
        }
        this._assetsMap[assetId][instance.instanceId] = assetInstance;
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
