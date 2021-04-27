import AudioHandler from '/library/scripts/core/handlers/AudioHandler.js';
import { VRButton } from '/library/scripts/three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from '/library/scripts/three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '/library/scripts/three/examples/jsm/controls/PointerLockControls.js';
import { DeviceOrientationControls } from '/library/scripts/three/examples/jsm/controls/DeviceOrientationControls.js';
import { Vector3 } from '/library/scripts/three/build/three.module.js';
import global from '/library/scripts/core/resources/global.js';

export default class SessionHandler {
    constructor(params) {
        if(params == null) {
            params = {};
        }
        this._orbitControlsTarget = (params['Orbit Controls Target'])
            ? params['Orbit Controls Target']
            : new Vector3(0,0,0);
        global.sessionActive = false;
        if(global.deviceType == "XR") {
            this._configureForXR();
        } else if(global.deviceType == "POINTER") {
            this._configureForPointer();
        } else if(global.deviceType == "MOBILE") {
            this._configureForMobile();
        }
    }

    _configureForXR() {
        this._div = VRButton.createButton(global.renderer);
        global.renderer.xr.addEventListener("sessionstart", () => {
            global.sessionActive = true;
            AudioHandler.init();
        });
        global.renderer.xr.addEventListener("sessionend", () => {
            global.sessionActive = false;
        });
    }

    _configureForPointer() {
        this._div = document.createElement('div');
        this._button = document.createElement('button');
        this._button.innerText = "CLICK TO START";
        this._stylizeElements();
        this._div.appendChild(this._button);

        this._controls = new OrbitControls(global.camera, global.renderer.domElement);
        this._controls.target = this._orbitControlsTarget;
        this._controls.enableKeys = false;
        //this._controls.enableZoom = false;
        this._controls.maxPolarAngle = Math.PI-0.5;
        this._controls.minPolarAngle = 0.5;
        this._controls.enabled = false;
        this._button.addEventListener('click', () => {
            this._div.style.display = "none";
            this._controls.enabled = true;
            global.sessionActive = true;
            AudioHandler.init();
        });
    }

    _configureForMobile() {
        this._div = document.createElement('div');
        this._button = document.createElement('button');
        this._button.innerText = "TAP TO START";
        this._stylizeElements();
        this._div.appendChild(this._button);

        this._controls = new OrbitControls(global.camera, global.renderer.domElement);
        this._controls.target = this._orbitControlsTarget;
        this._controls.zoomSpeed = 0.4;
        this._controls.enabled = false;
        this._button.addEventListener('click', () => {
            this._div.style.display = "none";
            this._controls.enabled = true;
            global.sessionActive = true;
            AudioHandler.init();
        });
    }

    _stylizeElements() {
        this._div.style.position = 'absolute';
        this._div.style.bottom = '20px';
        this._div.style.width = '100%';
        this._div.style.textAlign = 'center';
        this._button.style.padding = '12px';
        this._button.style.border = '1px solid #fff';
        this._button.style.borderRadius = '4px';
        this._button.style.background = 'rgba(0,0,0,0.1)';
        this._button.style.color = '#fff';
        this._button.style.font = 'normal 13px sans-serif';
        this._button.style.opacity = '0.5';
        this._button.style.outline = 'none';
        this._button.onmouseenter = () => { this._button.style.opacity = '1.0'; };
        this._button.onmouseleave = () => { this._button.style.opacity = '0.5'; };
    }

    displayButton() {
        document.body.appendChild(this._div);
    }

    enableOrbit() {
        this._controls.enabled = true;
    }

    disableOrbit() {
        this._controls.enabled = false;
    }

    update() {
        if(this._firstPersonControls && this._firstPersonControls.enabled) {
            this._firstPersonControls.update();
        }
    }
}
