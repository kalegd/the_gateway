import Avatar from '/library/scripts/core/assets/Avatar.js';
import BasicMovement from '/library/scripts/core/resources/BasicMovement.js';

import * as THREE from '/library/scripts/three/build/three.module.js';
import { GLTFLoader } from '/library/scripts/three/examples/jsm/loaders/GLTFLoader.js';
  
export default class UserController {
    constructor(params) {
        if(params == null) {
            params = {};
        }
        this._dynamicAssets = [];
        this._user = global.user;

        this._setup();
    }

    _setup() {
        this._avatar = new Avatar({
            "Focus Camera": true,
        });
        this._avatar.addToScene(this._user);
        if(BasicMovement.isDeviceTypeSupported(global.deviceType)) {
            let basicMovement = new BasicMovement({
                'Avatar': this._avatar,
                'Movement Speed (m/s)': 2,
            });
            this._dynamicAssets.push(basicMovement);
        }
    }

    addToScene() {
        this._avatar.addToScene(this._user);
    }

    removeFromScene() {
        this._avatar.removeFromScene();
    }

    canUpdate() {
        return true;
    }

    update(timeDelta) {
        for(let i = 0; i < this._dynamicAssets.length; i++) {
            this._dynamicAssets[i].update(timeDelta);
        }
    }

    static getScriptType() {
        return ScriptType.ASSET;
    }

    static getFields() {
        return [];
    }

}
