import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';

class AudioHandler {
    init() {
        if(this._audioListener) return;

        this._audioListener = new THREE.AudioListener();
        this._addEventListeners();
        global.camera.add(this._audioListener);
    }

    _addEventListeners() {
        //XR Event Listeners
        global.renderer.xr.addEventListener("sessionstart", () => {
            this._audioListener.context.resume();
        });
        global.renderer.xr.addEventListener("sessionend", () => {
            this._audioListener.context.suspend();
        });
    }

}

let audioHandler = new AudioHandler();
export default audioHandler;
