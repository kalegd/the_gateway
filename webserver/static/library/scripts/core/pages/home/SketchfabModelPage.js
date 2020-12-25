import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import SketchfabAPI from '/library/scripts/core/resources/SketchfabAPI.js';
import { zipToGLTF, fullDispose } from '/library/scripts/core/resources/utils.module.js';
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
        this._pivotPoint = new THREE.Object3D();
        this._controller = controller;
        this._interactables = [];
        this._createPage();
        this._addPageContent();
        this._createErrorBlock();
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
        rowBlock.add(this._titleBlock);
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
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.7,
            'width': 1.2,
            'contentDirection': 'column',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        this._imageBlock = ThreeMeshUIHelper.createImageButtonBlock({
            'height': 0.405,
            'width': 0.720,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0.5,
            'margin': 0.02,
        });
        this._previewButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Preview",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.5,
        });
        let previewInteractable = new PointerInteractable(
            this._previewButton,
            () => { this._preview(); });
        this._downloadButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Download",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.5,
        });
        let downloadInteractable = new PointerInteractable(
            this._downloadButton,
            () => { this._download(); });
        this._interactables.push(previewInteractable);
        this._interactables.push(downloadInteractable);
        columnBlock.add(this._imageBlock);
        columnBlock.add(this._previewButton);
        columnBlock.add(this._downloadButton);
        this._container.add(columnBlock);
    }

    _createErrorBlock() {
        this._errorMessage = ThreeMeshUIHelper.createTextBlock({
            'text': 'Error getting model from Sketchfab, please try again later',
            'fontColor': new THREE.Color(0x9c0006),
            'backgroundColor': new THREE.Color(0xffc7ce),
            'backgroundOpacity': 0.7,
            'fontSize': 0.08,
            'height': 0.2,
            'width': 1.4,
            'margin': 0
        });
        this._errorMessage.rotateY(Math.PI);
        this._errorMessage.position.setY(0.85);
        this._errorMessage.position.setZ(1.9);
        this._errorMessage.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._errorMessage.visible = false;
        this._pivotPoint.add(this._errorMessage);
    }

    _preview() {
        window.open(this._modelInfo.viewerUrl, '_blank');
    }

    _download() {
        let request = { 'userId': global.user._id, 'sketchfabUid': this._modelInfo.uid };
        $.ajax({
            url: global.API_URL + '/user/sketchfab/model',
            type: 'POST',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                //TODO: Update asset information for both general asset and user library asset
                //Take user to Library Model Page
                console.log(response);
            },
            error: (xhr, status, error) => {
                //TODO: Display error about getting model information
                console.log(error);
            }
        });
    }



    loadModelInfo(data) {
        console.log(data);
        this._modelInfo = data;
        let url = this._getPreviewUrl(data);
        new THREE.TextureLoader().load(url, (texture) => {
            if(this._pivotPoint.parent) {
                this._imageBlock.set({ backgroundTexture: texture });
                this._texture = texture;
            }
        });
    }

    _getPreviewUrl(data) {
        let images = data.thumbnails.images;
        for(let i = 0; i < images.length; i++) {
            if(images[i].height <= 576 && images[i].width <= 1024) {
                return images[i].url;
            }
        }
        if(images.length > 0) {
            return images[images.length-1].url;
        }
        return null;
    }

    _cleanup() {
        this._imageBlock.set({ backgroundTexture: null });
        if(this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
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
            this._errorMessage.visible = false;
            this._cleanup();
            fullDispose(this._pivotPoint);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default SketchfabResultsPage;
