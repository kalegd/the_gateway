import BackendAPI from '/library/scripts/core/apis/BackendAPI.js';
import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import WebworldController from '/library/scripts/core/resources/WebworldController.js';
import global from '/library/scripts/core/resources/global.js';
import TextField from '/library/scripts/core/resources/TextField.js';
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

const ERR_MSG = 'Error creating new webworld, please try again later';
const ERR_NO_NAME = 'Please enter a name for the webworld';

class NewWebworldPage {
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
        this._backButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Back",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Webworlds',
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
        rowBlock.add(this._backButton);
        rowBlock.add(titleBlock);
        rowBlock.add(spaceBlock);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(this._backButton, () => {
            this._controller.back();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
    }

    _addPageContent() {
        this._nameField = new TextField({
            'text': "type webworld name here...",
            'fontSize': 0.08,
            'height': 0.2,
            'width': 0.9,
            'onEnter': () => { this._create(); },
        });
        this._createButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Create",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.4,
        });
        let createInteractable = new PointerInteractable(this._createButton,
            () => { this._create(); });
        this._errorMessage = ThreeMeshUIHelper.createTextBlock({
            'text': ERR_MSG,
            'fontColor': new THREE.Color(0x9c0006),
            'backgroundColor': new THREE.Color(0xffc7ce),
            'backgroundOpacity': 0.7,
            'fontSize': 0.08,
            'height': 0.2,
            'width': 1.4,
            'margin': 0.04
        });
        this._errorMessage.visible = false;
        this._container.add(this._nameField.block);
        this._container.add(this._createButton);
        this._container.add(this._errorMessage);
        this._interactables.push(this._nameField.interactable);
        this._interactables.push(createInteractable);
    }

    _create() {
        if(this._nameField.isBlank()) {
            this._errorMessage.set({ content: ERR_NO_NAME });
            this._errorMessage.visible = true;
        }
        //I'm okay with this action being a blocking action
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._errorMessage.visible = false;
        this._createButton.visible = false;
        this._backButton.visible = false;
        let request = {
            'userId': global.user._id,
            'name': this._nameField.content
        };
        if(this._progenitorWebworldId) {
            request.webworldId = this._progenitorWebworldId;
        }
        BackendAPI.createWebworld({
            data: request,
            success: (response) => {
                this._createButton.visible = true;
                this._backButton.visible = true;
                this._controller.back();
                let page = this._controller.getPage(HomeSceneMenus.WEBWORLD);
                page.loadData(response.data);
                this._controller.goToPage(HomeSceneMenus.WEBWORLD);
            },
            error: (xhr, status, error) => {
                this._errorMessage.set({ content: ERR_MSG });
                this._errorMessage.visible = true;
                this._createButton.visible = true;
                this._backButton.visible = true;
                global.pointerInteractableManager.addInteractables(this._interactables);
            }
        });
    }

    setProgenitorWebworld(progenitorWebworld) {
        this._progenitorWebworldId = progenitorWebworld._id;
        this._nameField.setContent(progenitorWebworld.name + " Copy");
    }

    cleanup() {
        this._nameField.reset();
        this._errorMessage.visible = false;
        this._progenitorWebworldId = null;
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

export default NewWebworldPage;
