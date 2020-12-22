import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
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

class SketchfabResultsPage {
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

    loadInitialData(searchTerm, data) {
        this._results = data.results;
        this._cursor = 0;
        this._nextCursor = data.cursors.next;
        this._searchTerm = searchTerm;
        this._previewTextures = [];
        this._updatePreviews();
    }

    _previousPage() {
        if(this._cursor != 0) {
            global.pointerInteractableManager.removeInteractables(this._interactables);
            this._cursor -= this._previews.length;
            this._updatePreviews();
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    _nextPage() {
        if(this._nextCursor) {
            if(this._cursor + (2 * this._previews.length) <= this._nextCursor) {
                global.pointerInteractableManager.removeInteractables(this._interactables);
                this._cursor += this._previews.length;
                this._updatePreviews();
                global.pointerInteractableManager.addInteractables(this._interactables);
            } else {
                global.pointerInteractableManager.removeInteractables(this._interactables);
                for(let i = 0; i < this._previews.length; i++) {
                    this._previews[i].visible = false;
                }
                this._fetchMoreResults();
            }
        } else if(this._cursor + this._previews.length < this._results.length) {
            global.pointerInteractableManager.removeInteractables(this._interactables);
            this._cursor += this._previews.length;
            this._updatePreviews();
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    _fetchMoreResults() {
        SketchfabAPI.searchFrom(
            this._searchTerm,
            this._nextCursor,
            (data) => {
                this._results = this._results.concat(data.results);
                this._cursor += this._previews.length;
                this._nextCursor = data.cursors.next;
                this._updatePreviews();
                global.pointerInteractableManager.addInteractables(this._interactables);
            },
            () => {
                //TODO: display error message
                this._updatePreviews();
                global.pointerInteractableManager.addInteractables(this._interactables);
            });
    }

    _updatePreviews() {
        this._interactables = this._interactables.slice(0,2);
        for(let i = 0; i < this._previews.length; i++) {
            if(i + this._cursor < this._results.length) {
                this._previews[i].visible = true;
                this._previews[i].set({ backgroundTexture: null });
                this._previewInteractables[i].updateAction(() => {
                    console.log("TODO: Go to Sketchfab Model Page for model " + i);
                });
                this._interactables.push(this._previewInteractables[i]);
                let previewUrl = this._getPreviewUrl(this._results[this._cursor + i]);
                new THREE.TextureLoader().load(previewUrl, (texture) => {
                    this._previews[i].set({ backgroundTexture: texture });
                    this._previewTextures.push(texture);
                });
            } else {
                this._previews[i].visible = false;
                this._previewInteractables[i].updateAction(null);
            }
        }
        if(this._cursor != 0) {
            this._previousButton.visible = true;
            this._interactables.push(this._previousInteractable);
        } else {
            this._previousButton.visible = false;
        }
        if(this._cursor + this._previews.length < this._results.length || this._nextCursor) {
            this._nextButton.visible = true;
            this._interactables.push(this._nextInteractable);
        } else {
            this._nextButton.visible = false;
        }
    }

    _getPreviewUrl(data) {
        let images = data.thumbnails.images;
        for(let i = 0; i < images.length; i++) {
            if(images[i].height <= 405 && images[i].width <= 720) {
                return images[i].url;
            }
        }
        if(images.length > 0) {
            return images[images.length-1].url;
        }
        return null;
    }

    _cleanup() {
        for(let i = 0; i < this._previews.length; i++) {
            this._previews[i].set({ backgroundTexture: null });
        }
        for(let i = 0; i < this._previewTextures.length; i++) {
            this._previewTextures[i].dispose();
        }
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
            this._cleanup();
            fullDispose(this._container);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default SketchfabResultsPage;
