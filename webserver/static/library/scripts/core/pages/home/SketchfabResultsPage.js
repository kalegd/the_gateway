import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import { fullDispose } from '/library/scripts/core/resources/utils.module.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';

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
                //let previewBlock = new ThreeMeshUI.Block({
                //    'height': 0.405/2,
                //    'width': 0.720/2,
                //    'contentDirection': 'row',
                //    'justifyContent': 'center',
                //    'backgroundOpacity': 0.5,
                //    'margin': 0.02,
                //});
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
        this._container.add(columnBlock);
    }

    loadData(data) {
        console.log("TODO: Load data from API results");
        this._results = data.results;
        this._nextCursor = data.cursors.next;
        this._previousCursor = data.cursors.previous;
        if(this._container.parent) {
            console.log("Yo, we confirmed it works, you can delete me now");
            global.pointerInteractableManager.removeInteractables(this._interactables);
        }
        this._interactables = this._interactables.slice(0,2);
        for(let i = 0; i < this._previews.length; i++) {
            if(i < this._results.length) {
                this._previews[i].visible = true;
                this._previewInteractables[i].updateAction(() => {
                    console.log("Go to Sketchfab Model Page for model " + i);
                });
                this._interactables.push(this._previewInteractables[i]);
                let previewUrl = this._getPreviewUrl(this._results[i]);
                new THREE.TextureLoader().load(previewUrl, (texture) => {
                    this._previews[i].set({ backgroundTexture: texture });
                });
            } else {
                this._previews[i].visible = false;
                this._previewInteractables[i].updateAction(null);
            }
        }
        if(this._container.parent) {
            global.pointerInteractableManager.addInteractables(this._interactables);
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
            let backgroundTexture = this._previews[i].backgroundTexture;
            this._previews[i].set({ backgroundTexture: null });
            if(backgroundTexture) {
                backgroundTexture.dispose();
            }
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
