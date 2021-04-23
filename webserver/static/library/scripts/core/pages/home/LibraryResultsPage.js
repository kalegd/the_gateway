import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
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

class LibraryResultsPage {
    constructor(controller) {
        this._pivotPoint = new THREE.Object3D();
        this._controller = controller;
        this._interactables = [];
        this._previewTextures = [];
        this._createPage();
        this._addPageContent();
        //this._createErrorBlock();
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
            'text': 'Library',
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

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
        this._pivotPoint.add(this._container);
    }

    _addPageContent() {
        this._previews = [];
        this._previewInteractables = [];
        let rowBlock = new ThreeMeshUI.Block({
            'height': 0.7,
            'width': 1.2,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.7,
            'width': 1.2,
            'contentDirection': 'column',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        for(let i = 0; i < 3; i++) {
            let rowBlock = new ThreeMeshUI.Block({
                'height': 0.2025,
                'width': 1.2,
                'contentDirection': 'row',
                'justifyContent': 'center',
                'backgroundOpacity': 0,
                'margin': 0.02,
            });
            for(let j = 0; j < 3; j++) {
                let previewBlock = ThreeMeshUIHelper.createImageButtonBlock({
                    'height': 0.405/2,
                    'width': 0.720/2,
                    'contentDirection': 'row',
                    'justifyContent': 'center',
                    'backgroundOpacity': 0.5,
                    'margin': 0.02,
                });
                rowBlock.add(previewBlock);
                this._previews.push(previewBlock);
                let previewInteractable = new PointerInteractable(previewBlock);
                this._previewInteractables.push(previewInteractable);
            }
            columnBlock.add(rowBlock);
        }
        this._previousButton = ThreeMeshUIHelper.createButtonBlock({
            'text': '<',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.1,
        });
        this._previousButton.visible = false;
        this._previousInteractable = new PointerInteractable(this._previousButton,
            () => { this._previousPage() });
        this._nextButton = ThreeMeshUIHelper.createButtonBlock({
            'text': '>',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.1,
        });
        this._nextButton.visible = false;
        this._nextInteractable = new PointerInteractable(this._nextButton,
            () => { this._nextPage() });
        rowBlock.add(this._previousButton);
        rowBlock.add(columnBlock)
        rowBlock.add(this._nextButton);
        this._container.add(rowBlock);
    }

    //_createErrorBlock() {
    //    this._errorMessage = ThreeMeshUIHelper.createTextBlock({
    //        'text': 'Error searching Library, please try again later',
    //        'fontColor': new THREE.Color(0x9c0006),
    //        'backgroundColor': new THREE.Color(0xffc7ce),
    //        'backgroundOpacity': 0.7,
    //        'fontSize': 0.08,
    //        'height': 0.2,
    //        'width': 1.4,
    //        'margin': 0
    //    });
    //    this._errorMessage.rotateY(Math.PI);
    //    this._errorMessage.position.setY(0.85);
    //    this._errorMessage.position.setZ(1.9);
    //    this._errorMessage.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
    //    this._errorMessage.visible = false;
    //    this._pivotPoint.add(this._errorMessage);
    //}

    loadData(data) {
        this._results = data;
        this._cursor = 0;
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._updateMenu();
        global.pointerInteractableManager.addInteractables(this._interactables);
    }

    _previousPage() {
        if(this._cursor != 0) {
            global.pointerInteractableManager.removeInteractables(this._interactables);
            this._cursor -= this._previews.length;
            this._updateMenu();
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    _nextPage() {
        if(this._cursor + this._previews.length <= this._results.length) {
            global.pointerInteractableManager.removeInteractables(this._interactables);
            this._cursor += this._previews.length;
            this._updateMenu();
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    _updateMenu() {
        this._updatePreviews();

        if(this._cursor != 0) {
            this._previousButton.visible = true;
            this._interactables.push(this._previousInteractable);
        } else {
            this._previousButton.visible = false;
        }
        if(this._cursor + this._previews.length < this._results.length) {
            this._nextButton.visible = true;
            this._interactables.push(this._nextInteractable);
        } else {
            this._nextButton.visible = false;
        }
    }

    _updatePreviews() {
        this._interactables = this._interactables.slice(0,2);
        for(let i = 0; i < this._previews.length; i++) {
            let index = i + this._cursor;
            if(index < this._results.length) {
                this._previews[i].visible = true;
                this._previews[i].set({ backgroundTexture: null });
                this._previewInteractables[i].updateAction(() => {
                    this._goToPage(this._results[index]);
                });
                this._interactables.push(this._previewInteractables[i]);
                if(index < this._previewTextures.length) {
                    this._previews[i].set({
                        backgroundTexture: this._previewTextures[index]
                    });
                } else {
                    let previewUrl = this._getPreviewUrl(this._results[index]);
                    new THREE.TextureLoader().load(previewUrl, (texture) => {
                        if(this._pivotPoint.parent) {
                            this._previews[i].set({ backgroundTexture: texture });
                            this._previewTextures[index] = texture;
                        }
                    });
                }
            } else {
                this._previews[i].visible = false;
                this._previewInteractables[i].updateAction(null);
            }
        }
    }

    _getPreviewUrl(data) {
        //TODO: Add logic to determine if data is a model, material, or image
        let previewUrl = global.assetsMap[data.assetId].smallPreviewImage;
        return previewUrl;
    }

    _goToPage(data) {
        //TODO: Add logic to determine if data is a model, material, or image
        let page = this._controller.getPage(HomeSceneMenus.LIBRARY_MODEL);
        page.loadModelInfo(data);
        this._controller.goToPage(HomeSceneMenus.LIBRARY_MODEL);
    }

    cleanup() {
        for(let i = 0; i < this._previews.length; i++) {
            this._previews[i].set({ backgroundTexture: null });
        }
        for(let i = 0; i < this._previewTextures.length; i++) {
            if(this._previewTextures[i]) {
                this._previewTextures[i].dispose();
            }
        }
        this._previewTextures = [];
    }

    addToScene(scene) {
        if(scene) {
            this._updateMenu();
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

export default LibraryResultsPage;
