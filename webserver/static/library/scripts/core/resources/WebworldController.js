import BackendAPI from '/library/scripts/core/apis/BackendAPI.js';
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
        global.activeWebworld = webworld._id;
        for(let assetId in this._webworld.assets) {
            let asset = global.assetsMap[assetId];
            fetch(asset.filepath).then((response) => {
                return response.arrayBuffer();
            }).then((arrayBuffer) => {
                zipToGLTF(arrayBuffer,
                    (gltf) => {
                        if(global.activeWebworld != webworld._id) return;
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
        this._webworld = null;
        for(let assetId in this._assetsMap) {
            for(let instanceId in this._assetsMap[assetId]) {
                let assetInstance = this._assetsMap[assetId][instanceId];
                this._pivotPoint.remove(assetInstance);
                fullDispose(assetInstance);
            }
        }
        this._assetsMap = {};
        for(let assetId in this._gltfMap) {
            fullDispose(this._gltfMap[assetId].scene);
        }
        this._gltfMap = {};
    }

    deleteAsset(assetId) {
        if(this._assetsMap[assetId]) {
            for(let instanceId in this._assetsMap[assetId]) {
                let assetInstance = this._assetsMap[assetId][instanceId];
                this._pivotPoint.remove(assetInstance);
                fullDispose(assetInstance);
            }
            delete this._assetsMap[assetId];
        }
        if(this._gltfMap[assetId]) {
            fullDispose(this._gltfMap[assetId].scene);
            delete this._gltfMap[assetId];
        }
    }

    addAsset(asset, successCallback, errorCallback) {
        if(!this._webworld) {
            let request = {
                'userId': global.user._id,
                'name': 'Default'
            };
            BackendAPI.createWebworld({
                data: request,
                success: (response) => {
                    this._addAsset(asset, successCallback, errorCallback);
                },
                error: (xhr, status, error) => {
                    errorCallback();
                }
            });
        } else {
            this._addAsset(asset, successCallback, errorCallback);
        }
    }

    _addAsset(asset, successCallback, errorCallback) {
        if(asset.type == AssetTypes.MODEL) {
            if(asset.modelType == ModelTypes.GLTF) {
                this._fetchGLTF(asset, successCallback, errorCallback);
            } else {
                //FF: Handle other model types if we ever include them
                errorCallback();
            }
        } else {
            //FF: Handle other asset types when we include them
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
