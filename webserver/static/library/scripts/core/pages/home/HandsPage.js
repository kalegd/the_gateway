import Hands from '/library/scripts/core/enums/Hands.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import { fullDispose } from '/library/scripts/core/resources/utils.module.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
let hands = [{
        "userFriendlyName": "Normal",
        "handId": Hands.NORMAL
    }, {
        "userFriendlyName": "Flying",
        "handId": Hands.FLYING
    }, {
        "userFriendlyName": "Edit",
        "handId": Hands.EDIT
    }, {
        "userFriendlyName": "Translate",
        "handId": Hands.TRANSLATE
    }, {
        "userFriendlyName": "Rotate",
        "handId": Hands.ROTATE
    }, {
        "userFriendlyName": "Scale",
        "handId": Hands.SCALE
    }];

class HandsPage {
    constructor(controller) {
        this._controller = controller;
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
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Hands',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
            'margin': 0.07,
        });
        let spaceBlock = ThreeMeshUIHelper.createTextBlock({
            'text': ' ',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        rowBlock.add(backButton);
        rowBlock.add(titleBlock);
        rowBlock.add(spaceBlock);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        this._containerInteractable = new PointerInteractable(
            this._container.children[0], null, false);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        this._interactables.push(this._containerInteractable);
        this._containerInteractable.addChild(backInteractable);
    }

    _addPageContent() {
        let row1Block = new ThreeMeshUI.Block({
            'height': 0.2,
            'width': 1,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
            'margin': 0.02,
        });
        let row2Block = new ThreeMeshUI.Block({
            'height': 0.2,
            'width': 1,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
            'margin': 0.02,
        });
        let rowBlock = row1Block;
        for(let i = 0; i < 2; i++) {
            for(let j = 0; j < 3; j++) {
                let index = i * 3 + j;
                let handButton = ThreeMeshUIHelper.createButtonBlock({
                    'text': hands[index].userFriendlyName,
                    'fontSize': 0.08,
                    'height': 0.1,
                    'width': 0.4,
                });
                rowBlock.add(handButton);
                let interactable = new PointerInteractable(handButton, () => {
                    console.log("FF: Use " + hands[index].handId + " Hands");
                });
                this._containerInteractable.addChild(interactable);
            }
            rowBlock = row2Block
        }
        this._container.add(row1Block);
        this._container.add(row2Block);
    }

    addToScene(scene) {
        if(scene) {
            scene.add(this._container);
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
            fullDispose(this._container);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default HandsPage;
