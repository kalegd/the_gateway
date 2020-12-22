import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import TextField from '/library/scripts/core/resources/TextField.js';
import SketchfabAPI from '/library/scripts/core/resources/SketchfabAPI.js';
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

class SketchfabSearchPage {
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
            'text': 'Sketchfab',
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
            this._reset();
            this._controller.back();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
    }

    _addPageContent() {
        this._searchField = new TextField({
            'text': "type search keywords here...",
            'fontSize': 0.08,
            'height': 0.2,
            'width': 0.9,
            'onEnter': () => { this._search(); },
        });
        this._searchButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Search",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.4,
        });
        let searchInteractable = new PointerInteractable(this._searchButton,
            () => { this._search(); });
        this._errorMessage = ThreeMeshUIHelper.createTextBlock({
            'text': 'Error searching Sketchfab, please try again later',
            'fontColor': new THREE.Color(0x9c0006),
            'backgroundColor': new THREE.Color(0xffc7ce),
            'backgroundOpacity': 0.7,
            'fontSize': 0.08,
            'height': 0.2,
            'width': 1.4,
            'margin': 0.04
        });
        this._errorMessage.visible = false;
        this._container.add(this._searchField.block);
        this._container.add(this._searchButton);
        this._container.add(this._errorMessage);
        this._interactables.push(this._searchField.interactable);
        this._interactables.push(searchInteractable);
    }

    _reset() {
        this._errorMessage.visible = false;
        this._searchField.reset();
    }

    _search() {
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._searchButton.visible = false;
        this._backButton.visible = false;
        this._errorMessage.visible = false;
        SketchfabAPI.search(
            this._searchField.content,
            (response) => { this._processSearchResponse(response); },
            () => { this._processErrorResponse(); }
        );
    }

    _processSearchResponse(response) {
        this._controller.goToPage(HomeSceneMenus.SKETCHFAB_RESULTS);
        let page = this._controller.getPage(HomeSceneMenus.SKETCHFAB_RESULTS);
        page.loadInitialData(this._searchField.content, response);
        this._searchButton.visible = true;
        this._backButton.visible = true;
    }

    _processErrorResponse() {
        this._searchButton.visible = true;
        this._backButton.visible = true;
        this._errorMessage.visible = true;
        global.pointerInteractableManager.addInteractables(this._interactables);
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

export default SketchfabSearchPage;
