import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';

export default class AudioHandler {
    constructor() {
        this._audioListener = new THREE.AudioListener();
        this._addEventListeners();
        global.camera.add(this._audioListener);
        global.audioListener = this._audioListener;
    }

    _addEventListeners() {
        //XR Event Listeners
        global.renderer.xr.addEventListener("sessionstart", () => {
            this._audioListener.context.resume();
        });
        global.renderer.xr.addEventListener("sessionend", () => {
            this._audioListener.context.suspend();
        });
        //POINTER Event Listeners
        document.addEventListener('pointerlockchange', () => {
            this._onPointerLockChange();
        });
    }

    _onPointerLockChange() {
        if(global.sessionActive) {
            this._audioListener.context.resume();
        } else {
            this._audioListener.context.suspend();
        }
    }

}
