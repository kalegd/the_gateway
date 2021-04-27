import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import ConfirmationPage from '/library/scripts/core/pages/ConfirmationPage.js';
import WebworldController from '/library/scripts/core/resources/WebworldController.js';
import global from '/library/scripts/core/resources/global.js';
import XYZInput from '/library/scripts/core/resources/input/XYZInput.js';
import { fullDispose } from '/library/scripts/core/resources/utils.module.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';

class WebworldInstancePage {
    constructor(controller) {
        this._pivotPoint = new THREE.Object3D();
        this._controller = controller;
        this._interactables = [];
        this._createPage();
        //this._addPageContent();
    }

    _createPage() {
        this._container = new ThreeMeshUI.Block({
            height: 1,
            width: 1.5,
            backgroundColor: UI_BACKGROUND_COLOR,
            backgroundOpacity: UI_BACKGROUND_OPACITY,
        });
        let rowBlock = new ThreeMeshUI.Block({
            'height': 0.2,
            'width': 1,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        let backButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Back",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        this._titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Webworld',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
            'margin': 0.07,
        });
        this._deleteButton = ThreeMeshUIHelper.createButtonBlock({
            'text': 'Delete',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        rowBlock.add(backButton);
        rowBlock.add(this._titleBlock);
        rowBlock.add(this._deleteButton);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        let deleteInteractable = new PointerInteractable(this._deleteButton, () => {
            this._delete();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
        this._interactables.push(deleteInteractable);
        this._pivotPoint.add(this._container);
    }

    _addPageContent() {
        this._columnBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1.5,
            'contentDirection': 'column',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
        });
        this._positionInput = new XYZInput({
            initialValues: this._instance.position,
            title: "Position",
            onEnter: () => { this._updatePosition(); },
            onUpdate: () => { this._updatePosition(); },
        });
        this._rotationInput = new XYZInput({
            initialValues: this._instance.rotation,
            title: "Rotation",
            onEnter: () => { this._updateRotation(); },
            onUpdate: () => { this._updateRotation(); },
        });
        this._scaleInput = new XYZInput({
            initialValues: this._instance.scale,
            title: "Scale",
            onEnter: () => { this._updateScale(); },
            onUpdate: () => { this._updateScale(); },
        });
        this._columnBlock.add(this._positionInput.block);
        this._columnBlock.add(this._rotationInput.block);
        this._columnBlock.add(this._scaleInput.block);
        this._container.add(this._columnBlock);
        Array.prototype.push.apply(this._interactables,
            this._positionInput.interactables);
        Array.prototype.push.apply(this._interactables,
            this._rotationInput.interactables);
        Array.prototype.push.apply(this._interactables,
            this._scaleInput.interactables);
    }

    _createCopy() {
        console.log("TODO: Create this functionality and add it to the page");
    }

    _delete() {
        let webworld = global.webworldsMap[this._webworldId];
        if(this._webworldId == global.activeWebworld) {
            WebworldController.deleteInstance(this._assetId,
                this._instance.instanceId);
            if(!webworld.assets[this._assetId]) {
                this._controller.back(1);
            } else {
                this._controller.back();
            }
        } else {
            let instances = webworld.assets[this._assetId];
            for(let i = 0; i < instances.length; i++) {
                if(instances[i] == this._instance) {
                    instances.splice(i,1);
                    if(instances.length == 0) {
                        delete this._webworld.assets[this._assetId];
                        this._controller.back(1);
                        return;
                    }
                    break;
                }
            }
            this._controller.back();
        }
    }

    _updatePosition() {
        let x = this._positionInput.getX();
        let y = this._positionInput.getY();
        let z = this._positionInput.getZ();
        if(!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
            if(this._webworldId == global.activeWebworld) {
                WebworldController.updateInstance(this._assetId,
                    this._instance.instanceId, "position", [x,y,z]);
            } else {
                this._instance.position[0] = x;
                this._instance.position[1] = y;
                this._instance.position[2] = z;
            }
        }
    }

    _updateRotation() {
        let x = this._rotationInput.getX();
        let y = this._rotationInput.getY();
        let z = this._rotationInput.getZ();
        if(!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
            if(this._webworldId == global.activeWebworld) {
                WebworldController.updateInstance(this._assetId,
                    this._instance.instanceId, "rotation", [x,y,z]);
            } else {
                this._instance.rotation[0] = x;
                this._instance.rotation[1] = y;
                this._instance.rotation[2] = z;
            }
        }
    }

    _updateScale() {
        let x = this._scaleInput.getX();
        let y = this._scaleInput.getY();
        let z = this._scaleInput.getZ();
        if(!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
            if(this._webworldId == global.activeWebworld) {
                WebworldController.updateInstance(this._assetId,
                    this._instance.instanceId, "scale", [x,y,z]);
            } else {
                this._instance.scale[0] = x;
                this._instance.scale[1] = y;
                this._instance.scale[2] = z;
            }
        }
    }

    loadData(data) {
        this._assetId = data.assetId;
        this._instance = data.instance;
        this._webworldId = data.webworldId;
        if(this._columnBlock) {
            this._container.remove(this._columnBlock);
        }
        this._interactables = this._interactables.slice(0,3);
        this._addPageContent();
    }

    addToScene(scene) {
        if(scene) {
            scene.add(this._pivotPoint);
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    removeFromScene() {
        if(this._pivotPoint.parent) {
            this._pivotPoint.parent.remove(this._pivotPoint);
            fullDispose(this._pivotPoint);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default WebworldInstancePage;
