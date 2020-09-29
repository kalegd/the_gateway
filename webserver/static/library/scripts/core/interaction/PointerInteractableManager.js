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
        } else if(global.devicetype == "POINTER") {
            this.update = this._updateForPointer;
        } else if(global.devicetype == "MOBILE") {
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
        if(this._interactables.size() > 0) {
            this.update = this._update;
        }
    }

    removeInteractables(interactables) {
        interactables.forEach((interactable) => {
            this._interactables.remove(interactable);
            interactable.reset();
        });
        if(this._interactables.size() == 0) {
            this.update = () => {};
        }
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

    _raycastInteractables(controllers) {
        for(let option in controllers) {
            let controller = controllers[option];
            let raycaster = controller['raycaster'];
            let isPressed = controller['isPressed'];
            let closestInteractable;
            for(let interactable of this._interactables) {
                let threeObj = interactable.getThreeObj();
                let intersections;
                if(raycaster == null) {
                    intersections = [];
                } else {
                    intersections = raycaster.intersectObject(interactable, true);
                }
                if(intersections.length != 0) {
                    let distance = intersections[0].distance;
                    if(distance < controller['closestPointDistance']) {
                        controller['closestPointDistance'] = distance;
                        controller['closestPoint'] = intersections[0].point;
                        closestInteractable = interactable;
                    }
                }
            }
            let hoveredInteractable = this._hoveredInteractables[option];
            let selectedInteractable = this._selectedInteractables[option];
            if(closestInteractable) {
                if(isPressed)
                    if(hoveredInteractable == closestInteractable) {
                        closestInteractable.addSelectedBy(option);
                        this._selectedInteractables[option] = closestInteractable;
                    }
                    closestInteractable.removeHoveredBy(option);
                    this._hoveredInteractables[option] = null;
                } else {
                    if(hoveredInteractable != closestInteractable) {
                        hoveredInteractable.removeHoveredBy(option);
                        closestInteractable.addHoveredBy(option);
                        this._hoveredInteractables[option] = closestInteractable;
                    }
                    if(selectedInteractable) {
                        selectedInteractable.removeSelectedBy(option);
                    }
                }
            } else {
                if(hoveredInteractable) {
                    hoveredInteractable.removeHoveredBy(option);
                }
                if(selectedInteractable) {
                    selectedInteractable.removeSelectedBy(option);
                }
            }
        }
    }

    _updateForXR() {
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

        this._raycastInteractables(controllers);
    }

    _updateForPointer() {
        let controllers = {
            "POINTER": {
                raycaster: this._getRaycaster("POINTER"),
                isPressed: this._isControllerPressed("POINTER"),
                closestPoint: null,
                closestPointDistance: Number.MAX_SAFE_INTEGER,
            }
        };

        this._raycastUI(controllers);
    }

    _updateForMobile() {
        
    }

}

export default PointerInteractableManager;
