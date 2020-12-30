import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import ConfirmationPage from '/library/scripts/core/pages/ConfirmationPage.js';
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

let links = [{
        "userFriendlyName": "Select",
        "function": "_select"
    }, {
        "userFriendlyName": "Assets",
        "function": "_goToAssets"
    }, {
        "userFriendlyName": "Create Copy",
        "function": "_createCopy"
    }, {
        "userFriendlyName": "Make Default",
        "function": "_makeDefault"
    }, {
        "userFriendlyName": "Delete",
        "function": "_delete"
    }];

class WebworldPage {
    constructor(controller) {
        this._pivotPoint = new THREE.Object3D();
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
        this._titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Webworld',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
            'margin': 0.07,
        });
        let saveButton = ThreeMeshUIHelper.createButtonBlock({
            'text': 'Save',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        rowBlock.add(backButton);
        rowBlock.add(this._titleBlock);
        rowBlock.add(saveButton);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        let saveInteractable = new PointerInteractable(saveButton, () => {
            this._save();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
        this._interactables.push(saveInteractable);
        this._pivotPoint.add(this._container);
    }

    _addPageContent() {
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1.2,
            'contentDirection': 'column',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
        });
        for(let i = 0; i < links.length; i++) {
            let linkButton = ThreeMeshUIHelper.createButtonBlock({
                'text': links[i].userFriendlyName,
                'fontSize': 0.08,
                'height': 0.1,
                'width': 1,
            });
            columnBlock.add(linkButton);
            let interactable = new PointerInteractable(linkButton, () => {
                this[links[i].function]();
            });
            this._interactables.push(interactable);
        }
        this._container.add(columnBlock);
    }

    _select() {
        console.log("TODO: Use this webworld as the active webworld");
    }

    _goToAssets() {
        console.log("TODO: Go to Webworld Assets Page");
    }

    _createCopy() {
        console.log("TODO: Go to new Webworld Page with this webworld as template");
    }

    _makeDefault() {
        console.log("TODO: Make this webworld the default");
    }

    _delete() {
        console.log("TODO: Delete Webworld");
        if(!this._confirmationPage) {
            let errorMessage = ThreeMeshUIHelper.createTextBlock({
                'text': 'Error deleting Webworld, please try again later',
                'fontColor': new THREE.Color(0x9c0006),
                'backgroundColor': new THREE.Color(0xffc7ce),
                'backgroundOpacity': 0.7,
                'fontSize': 0.08,
                'height': 0.2,
                'width': 1.4,
                'margin': 0
            });
            this._confirmationPage = new ConfirmationPage({
                'Subtitle': "Deletion is permanent",
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
            'userId': global.user._id,
            'sceneId': this._webworld._id
        };
        $.ajax({
            url: global.API_URL + '/user/scene',
            type: 'DELETE',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                //TODO: Delete scene from global.user and global.scenesMap. If
                //      this scene is currently selected then use next highest
                //      priority scene. Go back a page
                console.log("TODO: Delete scene");
                this._confirmationPage.removeFromScene();
                this._controller.back();
            },
            error: (xhr, status, error) => {
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

    loadData(data) {
        console.log(data);
        this._webworld = data;
        this._titleBlock.children[1].set({ content: data.name });
    }

    _save() {
        console.log("TODO: Save webworld");
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

export default WebworldPage;
