import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
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

class ConfirmationPage {
    constructor(params) {
        this._pivotPoint = new THREE.Object3D();
        this._title = params['Title'] || 'Are you sure?';
        this._subtitle = params['Subtitle'] || ' ';
        this._errorMessage = params['Error Message'];
        this._button1Text = params['Button 1 Text'] || 'Confirm';
        this._button2Text = params['Button 2 Text'] || 'Cancel';
        this._button1Func = params['Button 1 Function'] || function() {};
        this._button2Func = params['Button 2 Function'] || function() {};
        this._interactables = [];
        this._createPage();
        this._addPageContent();
    }

    _createPage() {
        this._container = new ThreeMeshUI.Block({
            height: 1,
            width: 1.5,
            backgroundColor: UI_BACKGROUND_COLOR,
            backgroundOpacity: UI_BACKGROUND_OPACITY,
        }); 
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': this._title,
            'fontSize': 0.1,
            'height': 0.2,
            'width': 1.2,
        });
        let subtitleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': this._subtitle,
            'fontSize': 0.08,
            'height': 0.1,
            'width': 1.2,
            'margin': 0,
        });
        this._container.add(titleBlock);
        this._container.add(subtitleBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });    
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);
        
        let interactable = new PointerInteractable(this._container.children[0]);
        this._interactables.push(interactable);

        this._pivotPoint.add(this._container);
    }

    _addPageContent() {
        let rowBlock = new ThreeMeshUI.Block({
            'height': 0.1,
            'width': 1,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        let button1 = ThreeMeshUIHelper.createButtonBlock({
            'text': this._button1Text,
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.6,
        });
        let button2 = ThreeMeshUIHelper.createButtonBlock({
            'text': this._button2Text,
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.6,
        });
        let button1Interactable = new PointerInteractable(button1,
                                                       this._button1Func);
        let button2Interactable = new PointerInteractable(button2,
                                                       this._button2Func);
        rowBlock.add(button1);
        rowBlock.add(button2);
        this._container.add(rowBlock);
        if(this._errorMessage) {
            this._errorMessage.visible = false;
            this._container.add(this._errorMessage);
        }
        this._interactables.push(button1Interactable);
        this._interactables.push(button2Interactable);
    }

    showErrorMessage() {
        if(this._errorMessage) {
            this._errorMessage.visible = true;
        }
    }

    hideErrorMessage() {
        if(this._errorMessage) {
            this._errorMessage.visible = false;
        }
    }

    disableButtons() {
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }

    enableButtons() {
        global.pointerInteractableManager.addInteractables(this._interactables);
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

export default ConfirmationPage;
