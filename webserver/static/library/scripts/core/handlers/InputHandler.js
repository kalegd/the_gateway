import global from '/library/scripts/core/resources/global.js';
import { Object3D, Vector2 } from '/library/scripts/three/build/three.module.js';

//Provides Polling for XR Input Sources, Keyboard, or Mobile Touch Screen inputs
export default class InputHandler {
    constructor(renderer, controllerParent) {
        this._renderer = renderer;
        this._controllerParent = controllerParent;
        this._session;
        this._leftXRInputSource;
        this._rightXRInputSource;
        this._leftXRController = {
            "targetRay": new Object3D(),
            "grip": new Object3D()
        };
        this._rightXRController = {
            "targetRay": new Object3D(),
            "grip": new Object3D()
        };
        this._pointerPosition = new Vector2();
        this._pointerPressed = false;
        this._keysPressed = new Set();
        this._screenTouched = false;
        this._addEventListeners();
    }

    _addEventListeners() {
        //XR Event Listeners
        this._renderer.xr.addEventListener("sessionstart", (event) => {
            this._onXRSessionStart(event)
        });
        this._renderer.xr.addEventListener("sessionend", (event) => {
            this._onXRSessionEnd(event)
        });

        //POINTER Event Listeners
        document.addEventListener('keydown', (event) => {
            this._keysPressed.add(event.code);
        });
        document.addEventListener('keyup', (event) => {
            this._keysPressed.delete(event.code);
        });
        if(global.isChrome) {
            document.addEventListener('pointerlockchange', (event) => {
                if(!global.sessionActive) this._keysPressed.clear();
            });
        }
        document.addEventListener( 'mousedown', () => {
            this._pointerPressed = true;
        });
        document.addEventListener( 'mouseup', () => {
            this._pointerPressed = false;
        });
        document.addEventListener( 'mousemove', (event) => {
            this._pointerPosition.x = (event.clientX/window.innerWidth)*2-1;
            this._pointerPosition.y = -(event.clientY/window.innerHeight)*2+1;
        });

        //MOBILE Event Listeners
        document.addEventListener('touchstart', () => {
            this._screenTouched = true;
            this._pointerPosition.x = (event.touches[0].clientX/window.innerWidth)*2-1;
            this._pointerPosition.y = -(event.touches[0].clientY/window.innerHeight)*2+1;
        });
        document.addEventListener('touchend', () => {
            this._screenTouched = false;
        });
        document.addEventListener( 'touchmove', (event) => {
            this._pointerPosition.x = (event.touches[0].clientX/window.innerWidth)*2-1;
            this._pointerPosition.y = -(event.touches[0].clientY/window.innerHeight)*2+1;
        });
    }

    _onXRSessionStart(event) {
        this._session = this._renderer.xr.getSession();
        this._session.oninputsourceschange = (event) => {
            this._onXRInputSourceChange(event);
        };
        let inputSources = this._session.inputSources;
        for(let i = 0; i < inputSources.length; i++) {
            if(inputSources[i].handedness == "right") {
                this._rightXRInputSource = inputSources[i];
                this._controllerParent.add(this._rightXRController.targetRay);
                this._controllerParent.add(this._rightXRController.grip);
            } else if(inputSources[i].handedness == "left") {
                this._leftXRInputSource = inputSources[i];
                this._controllerParent.add(this._leftXRController.targetRay);
                this._controllerParent.add(this._leftXRController.grip);
            }
        }
    }

    _onXRSessionEnd(event) {
        this._session.oninputsourcechange = null;
        this._session = null;
        this._rightXRInputSource = null;
        this._leftXRInputSource = null;
        this._controllerParent.remove(this._rightXRController.targetRay);
        this._controllerParent.remove(this._rightXRController.grip);
        this._controllerParent.remove(this._leftXRController.targetRay);
        this._controllerParent.remove(this._leftXRController.grip);
    }

    _onXRInputSourceChange(event) {
        for(let i = 0; i < event.removed.length; i++) {
            if(event.removed[i] == this._rightXRInputSource) {
                this._rightXRInputSource = null;
                this._controllerParent.remove(this._rightXRController.targetRay);
                this._controllerParent.remove(this._rightXRController.grip);
            } else if(event.removed[i] == this._leftXRInputSource) {
                this._leftXRInputSource = null;
                this._controllerParent.remove(this._leftXRController.targetRay);
                this._controllerParent.remove(this._leftXRController.grip);
            }
        }
        for(let i = 0; i < event.added.length; i++) {
            if(event.added[i].handedness == "right") {
                this._rightXRInputSource = event.added[i];
                this._controllerParent.add(this._rightXRController.targetRay);
                this._controllerParent.add(this._rightXRController.grip);
            } else if(event.added[i].handedness == "left") {
                this._leftXRInputSource = event.added[i];
                this._controllerParent.add(this._leftXRController.targetRay);
                this._controllerParent.add(this._leftXRController.grip);
            }
        }
    }

    getXRGamepad(hand) {
        if(hand == "LEFT") {
            return (this._leftXRInputSource)
                ? this._leftXRInputSource.gamepad
                : null;
        } else if(hand == "RIGHT") {
            return (this._rightXRInputSource)
                ? this._rightXRInputSource.gamepad
                : null;
        } else {
            return null;
        }
    }

    getXRController(hand, type) {
        if(hand == 'LEFT') {
            return this._leftXRController[type];
        } else if(hand == 'RIGHT') {
            return this._rightXRController[type];
        }
    }

    getPointerPosition() {
        return this._pointerPosition;
    }

    isPointerPressed() {
        return this._pointerPressed;
    }

    isKeyPressed(code) {
        return this._keysPressed.has(code);
    }

    isScreenTouched() {
        return this._screenTouched;
    }

    _updateXRController(frame, referenceSpace, xrInputSource, xrController) {
        if(xrInputSource) {
            let targetRayPose = frame.getPose(
                xrInputSource.targetRaySpace, referenceSpace
            );
            if(targetRayPose != null) {
                xrController.targetRay.matrix.fromArray(
                    targetRayPose.transform.matrix
                );
                xrController.targetRay.matrix.decompose(
                    xrController.targetRay.position,
                    xrController.targetRay.rotation,
                    xrController.targetRay.scale
                );
            }

            let gripPose = frame.getPose(
                xrInputSource.gripSpace, referenceSpace
            );
            if ( gripPose !== null ) {
                xrController.grip.matrix.fromArray(gripPose.transform.matrix);
                xrController.grip.matrix.decompose(
                    xrController.grip.position,
                    xrController.grip.rotation,
                    xrController.grip.scale
                );
            }
        }
    }

    update(frame) {
        if(frame == null) {
            return;
        }
        //Assumes device type is XR
        let referenceSpace = this._renderer.xr.getReferenceSpace();
        this._updateXRController(
            frame,
            referenceSpace,
            this._leftXRInputSource,
            this._leftXRController
        );
        this._updateXRController(
            frame,
            referenceSpace,
            this._rightXRInputSource,
            this._rightXRController
        );
    }
}
