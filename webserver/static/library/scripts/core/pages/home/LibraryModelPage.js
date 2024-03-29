import BackendAPI from '/library/scripts/core/apis/BackendAPI.js';
import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import ConfirmationPage from '/library/scripts/core/pages/ConfirmationPage.js';
import WebworldController from '/library/scripts/core/resources/WebworldController.js';
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

class LibraryModelPage {
    constructor(controller) {
        this._pivotPoint = new THREE.Object3D();
        this._controller = controller;
        this._interactables = [];
        this._createPage();
        this._addPageContent();
        this._createErrorBlock();
        this._assetsDownloading = new Set();
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
        rowBlock.add(this._titleBlock);
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
        this._addToWebworldButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Add To Scene",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.55,
        });
        this._addToWebworldInteractable = new PointerInteractable(
            this._addToWebworldButton,
            () => { this._addToWebworld(); });
        this._deleteButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Delete",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.55,
        });
        this._deleteInteractable = new PointerInteractable(
            this._deleteButton,
            () => { this._delete(); });
        this._interactables.push(this._addToWebworldInteractable);
        this._interactables.push(this._deleteInteractable);
        columnBlock.add(this._imageBlock);
        columnBlock.add(this._addToWebworldButton);
        columnBlock.add(this._deleteButton);
        this._container.add(columnBlock);
    }

    _createErrorBlock() {
        this._errorMessage = ThreeMeshUIHelper.createTextBlock({
            'text': 'Error fetching model, please try again later',
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

    _addToWebworld() {
        global.pointerInteractableManager.removeInteractables([this._addToWebworldInteractable]);
        let assetId = this._modelInfo.assetId;
        this._errorMessage.visible = false;
        this._addToWebworldButton.visible = false;
        this._assetsDownloading.add(assetId);
        WebworldController.addAsset(global.assetsMap[this._modelInfo.assetId],
            () => {//success
                this._assetsDownloading.delete(assetId);
                if(this._pivotPoint.parent && this._modelInfo.assetId == assetId) {
                    this._addToWebworldButton.visible = true;
                    global.pointerInteractableManager.addInteractables([
                        this._addToWebworldInteractable]);
                }
            }, () => {//error
                if(this._pivotPoint.parent &&
                    this._modelInfo.assetId == assetId)
                {
                    this._addToWebworldButton.visible = true;
                    this._errorMessage.visible = true;
                    global.pointerInteractableManager.addInteractables([
                        this._addToWebworldInteractable]);
                }
                this._assetsDownloading.delete(assetId);
            });
    }

    _delete() {
        if(!this._confirmationPage) {
            let errorMessage = ThreeMeshUIHelper.createTextBlock({
                'text': 'Error deleting Asset, please try again later',
                'fontColor': new THREE.Color(0x9c0006),
                'backgroundColor': new THREE.Color(0xffc7ce),
                'backgroundOpacity': 0.7,
                'fontSize': 0.08,
                'height': 0.2,
                'width': 1.4,
                'margin': 0
            });
            this._confirmationPage = new ConfirmationPage({
                'Subtitle': "This will delete the model from all of your Webworlds",
                'Button 1 Function': () => { this._confirmDelete(); },
                'Button 2 Function': () => { this._declineDelete(); },
                'Error Message': errorMessage
            });
        }
        this._confirmationPage.addToScene(this._pivotPoint.parent);
        this.removeFromScene();
    }

    _confirmDelete() {
        this._confirmationPage.disableButtons();
        this._confirmationPage.hideErrorMessage();
        let request = {
            userId: global.user._id,
            assetId: this._modelInfo.assetId
        };
        BackendAPI.deleteAsset({
            data: request,
            success: () => {
                this._confirmationPage.removeFromScene();
                this._controller.back();
            },
            error: () => {
                console.log("TODO: Let the user know we failed");
                this._confirmationPage.showErrorMessage();
                this._confirmationPage.enableButtons();
            }
        });
    }

    _declineDelete() {
        this._confirmationPage.hideErrorMessage();
        this.addToScene(this._confirmationPage._pivotPoint.parent);
        this._confirmationPage.removeFromScene();
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
        this._titleBlock.children[1].set({ content: data.name });
        if(this._assetsDownloading.has(data.assetId)) {
            this._addToWebworldButton.visible = false;
        } else {
            this._addToWebworldButton.visible = true;
        }
    }

    _getPreviewUrl(data) {
        //We know it's a model, so we know what field to fetch
        let previewUrl = global.assetsMap[data.assetId].mediumPreviewImage;
        return previewUrl;
    }

    cleanup() {
        this._imageBlock.set({ backgroundTexture: null });
        if(this._texture) {
            this._texture.dispose();
            this._texture = null;
        }
    }

    addToScene(scene) {
        if(scene) {
            scene.add(this._pivotPoint);
            if(this._addToWebworldButton.visible) {
                global.pointerInteractableManager.addInteractables(this._interactables);
            } else {
                global.pointerInteractableManager.addInteractables(this._interactables.slice(0,2));
            }
        }
    }

    removeFromScene() {
        if(this._pivotPoint.parent) {
            this._pivotPoint.parent.remove(this._pivotPoint);
            this._errorMessage.visible = false;
            fullDispose(this._pivotPoint);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default LibraryModelPage;
