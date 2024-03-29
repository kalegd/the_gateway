import States from '/library/scripts/core/enums/PointerInteractableStates.js';
import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';

class PointerInteractableManager {
    constructor() {
        this._interactables = new Set();
        this._hoveredInteractables = {};
        this._selectedInteractables = {};
        if(global.deviceType == "XR") {
            this.update = this._updateForXR;
        } else if(global.deviceType == "POINTER") {
            this.update = this._updateForPointer;
        } else if(global.deviceType == "MOBILE") {
            this.update = this._updateForMobile;
        } else {
            this.update = () => {};
        }
        this._update = this.update;
        this.update = () => {};
    }

    addInteractables(interactables) {
        interactables.forEach((interactable) => {
            this._interactables.add(interactable);
        });
        if(this._interactables.size > 0) {
            this.update = this._update;
        }
    }

    removeInteractables(interactables) {
        interactables.forEach((interactable) => {
            this._interactables.delete(interactable);
            interactable.reset();
        });
        if(this._interactables.size == 0) {
            this.update = () => {};
        }
    }

    reset() {
        this._interactables.forEach(interactable => { interactable.reset(); });
        this._interactables = new Set();
        this._hoveredInteractables = {};
        this._selectedInteractables = {};
    }

    _getRaycaster(option) {
        if(option == "LEFT" || option == "RIGHT") {
            let position = new THREE.Vector3();
            let direction = new THREE.Vector3();
            let xrController = global.inputHandler.getXRController(option,
                "targetRay");
            xrController.getWorldPosition(position);
            xrController.getWorldDirection(direction).negate().normalize();
            return new THREE.Raycaster(position, direction, 0.01, 5);
        } else if(option == "POINTER") {
            let position = global.inputHandler.getPointerPosition();
            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(position, global.camera);
            return raycaster;
        } else if(option == "MOBILE") {
            let position = global.inputHandler.getPointerPosition();
            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(position, global.camera);
            return raycaster;
        }
    }

    _isControllerPressed(option) {
        if(option == "LEFT" || option == "RIGHT") {
            let gamepad = global.inputHandler.getXRGamepad(option);
            return gamepad != null && gamepad.buttons[0].pressed;
        } else if(option == "POINTER") {
            return global.inputHandler.isPointerPressed();
        } else if(option == "MOBILE") {
            return global.inputHandler.isScreenTouched();
        }
    }

    _raycastInteractables(controller, interactables) {
        let raycaster = controller['raycaster'];
        for(let interactable of interactables) {
            let threeObj = interactable.getThreeObj();
            let intersections;
            if(raycaster == null) {
                intersections = [];
            } else {
                intersections = raycaster.intersectObject(threeObj, true);
            }
            if(intersections.length != 0) {
                if(interactable.children.size != 0) {
                    this._raycastInteractables(controller, Array.from(interactable.children));
                }
                let distance = intersections[0].distance;
                if(!interactable.isOnlyGroup() && distance < controller['closestPointDistance']) {
                    controller['closestPointDistance'] = distance;
                    controller['closestPoint'] = intersections[0].point;
                    controller['closestInteractable'] = interactable;
                }
            }
        }
    }

    _updateInteractables(controllers) {
        for(let option in controllers) {
            let controller = controllers[option];
            let isPressed = controller['isPressed'];
            this._raycastInteractables(controller, this._interactables);
            let hoveredInteractable = this._hoveredInteractables[option];
            let selectedInteractable = this._selectedInteractables[option];
            let closestInteractable = controller['closestInteractable'];
            if(closestInteractable) {
                if(isPressed) {
                    if(hoveredInteractable == closestInteractable) {
                        closestInteractable.addSelectedBy(option);
                        this._selectedInteractables[option] = closestInteractable;
                        closestInteractable.removeHoveredBy(option);
                        this._hoveredInteractables[option] = null;
                    }
                } else {
                    if(hoveredInteractable != closestInteractable) {
                        if(hoveredInteractable) {
                            hoveredInteractable.removeHoveredBy(option);
                        }
                        closestInteractable.addHoveredBy(option);
                        this._hoveredInteractables[option] = closestInteractable;
                    }
                    if(selectedInteractable) {
                        selectedInteractable.removeSelectedBy(option);
                    }
                }
            } else if(!isPressed) {
                if(hoveredInteractable) {
                    hoveredInteractable.removeHoveredBy(option);
                    this._hoveredInteractables[option] = null;
                }
                if(selectedInteractable) {
                    selectedInteractable.removeSelectedBy(option);
                    this._selectedInteractables[option] = null;
                }
            }
        }
    }

    _updateForXR() {
        if(!global.sessionActive) return;
        let controllers = {};
        let controllerOptions = ['LEFT', 'RIGHT'];
        for(let i = 0; i < controllerOptions.length; i++) {
            let option = controllerOptions[i];
            controllers[option] = {
                raycaster: this._getRaycaster(option),
                isPressed: this._isControllerPressed(option),
                closestPoint: null,
                closestPointDistance: Number.MAX_SAFE_INTEGER,
            };
        }

        this._updateInteractables(controllers);
    }

    _updateForPointer() {
        if(!global.sessionActive) return;
        let controllers = {
            "POINTER": {
                raycaster: this._getRaycaster("POINTER"),
                isPressed: this._isControllerPressed("POINTER"),
                closestPoint: null,
                closestPointDistance: Number.MAX_SAFE_INTEGER,
            }
        };

        this._updateInteractables(controllers);
    }

    _updateForMobile() {
        if(!global.sessionActive) return;
    }

}

export default PointerInteractableManager;
