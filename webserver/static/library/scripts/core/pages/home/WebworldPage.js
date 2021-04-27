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
        "userFriendlyName": "Delete",
        "function": "_delete"
    }, {
        "userFriendlyName": "Make Default",
        "function": "_makeDefault"
    }];

class WebworldPage {
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
            'text': 'Webworld',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
            'margin': 0.07,
        });
        this._saveButton = ThreeMeshUIHelper.createButtonBlock({
            'text': 'Save',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        rowBlock.add(backButton);
        rowBlock.add(this._titleBlock);
        rowBlock.add(this._saveButton);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        let saveInteractable = new PointerInteractable(this._saveButton, () => {
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
        this._buttons = [];
        for(let i = 0; i < links.length; i++) {
            let linkButton = ThreeMeshUIHelper.createButtonBlock({
                'text': links[i].userFriendlyName,
                'fontSize': 0.08,
                'height': 0.1,
                'width': 1,
            });
            this._buttons.push(linkButton);
            columnBlock.add(linkButton);
            let interactable = new PointerInteractable(linkButton, () => {
                this._errorMessage.visible = false;
                this[links[i].function]();
            });
            this._interactables.push(interactable);
        }
        this._container.add(columnBlock);
    }

    _createErrorBlock() {
        this._errorMessage = ThreeMeshUIHelper.createTextBlock({
            'text': 'Error saving Webworld, please try again',
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

    _select() {
        WebworldController.setWebworld(this._webworld);
        this._buttons[0].visible = false;
        global.pointerInteractableManager.removeInteractables([this._interactables[3]]);
    }

    _goToAssets() {
        let page = this._controller.getPage(HomeSceneMenus.WEBWORLD_ASSETS);
        page.loadData(this._webworld);
        this._controller.goToPage(HomeSceneMenus.WEBWORLD_ASSETS);
    }

    _createCopy() {
        let page = this._controller.getPage(HomeSceneMenus.NEW_WEBWORLD);
        page.setProgenitorWebworld(this._webworld);
        this._controller.back();
        this._controller.goToPage(HomeSceneMenus.NEW_WEBWORLD);
    }

    _makeDefault() {
        this._buttons[4].visible = false;
        global.pointerInteractableManager.removeInteractables([this._interactables[7]]);
        let request = {
            'userId': global.user._id,
            'webworldId': this._webworld._id
        };
        this._activeDefaultRequest = true;
        $.ajax({
            url: global.API_URL + '/user/defaultWebworld',
            type: 'PUT',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                global.user.defaultWebworld = request.webworldId;
                this._handleMakeDefaultResponse();
            },
            error: (xhr, status, error) => {
                this._handleMakeDefaultResponse();
            }
        });
    }

    _handleMakeDefaultResponse() {
        this._activeDefaultRequest = false;
        if(this._pivotPoint.parent
            && this._webworld._id != global.user.defaultWebworld)
        {   
            this._buttons[4].visible = true;
            global.pointerInteractableManager.addInteractables([this._interactables[7]]);
        }
    }

    _delete() {
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
            'webworldId': this._webworld._id
        };
        $.ajax({
            url: global.API_URL + '/user/webworld',
            type: 'DELETE',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                global.user.webworlds = global.user.webworlds.filter(
                    webworldId => webworldId != request.webworldId);
                delete global.webworldsMap[request.webworldId];
                if(global.user.defaultWebworld == request.webworldId) {
                    global.user.defaultWebworld = (global.user.webworlds.length > 0)
                        ? global.user.webworlds[0]
                        : null;
                }
                if(global.activeWebworld == request.webworldId) {
                    WebworldController.clearWebworld();
                    if(global.user.defaultWebworld) {
                        WebworldController.setWebworld(
                            global.webworldsMap[global.user.defaultWebworld]);
                    }
                }
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
        this._webworld = data;
        this._titleBlock.children[1].set({ content: data.name });
        if(global.activeWebworld == data._id) {
            this._buttons[0].visible = false;
        } else {
            this._buttons[0].visible = true;
        }
        if(global.user.defaultWebworld == data._id || this._activeDefaultRequest) {
            this._buttons[4].visible = false;
        } else {
            this._buttons[4].visible = true;
        }
    }

    _save() {
        this._saveButton.visible = false;
        global.pointerInteractableManager.removeInteractables([this._interactables[2]]);
        let request = {
            'userId': global.user._id,
            'webworld': this._webworld
        };
        $.ajax({
            url: global.API_URL + '/user/webworld',
            type: 'PUT',
            data: JSON.stringify(request),
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                if(this._pivotPoint.parent && this._webworld._id == request.webworld._id) {
                    this._saveButton.visible = true;
                    global.pointerInteractableManager.addInteractables([this._interactables[2]]);
                }
            },
            error: (xhr, status, error) => {
                if(this._pivotPoint.parent && this._webworld._id == request.webworld._id) {
                    this._errorMessage.visible = true;
                    this._saveButton.visible = true;
                    global.pointerInteractableManager.addInteractables([this._interactables[2]]);
                }
            }
        });
    }

    _getVisibleInteractables() {
        return this._interactables.filter(i => i.getThreeObj().visible);
    }

    addToScene(scene) {
        if(scene) {
            scene.add(this._pivotPoint);
            global.pointerInteractableManager.addInteractables(this._getVisibleInteractables());
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
