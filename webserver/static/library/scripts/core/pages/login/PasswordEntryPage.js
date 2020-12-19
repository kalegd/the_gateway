import SceneNames from '/library/scripts/core/enums/SceneNames.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
import global from '/library/scripts/core/resources/global.js';
import PasswordTextField from '/library/scripts/core/resources/PasswordTextField.js';

import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';

class PasswordEntryPage {
    constructor(backFunc) {
        this._interactables = [];
        this._password = "";
        this._createPage();
        this._addPageContent(backFunc);
    }

    _createPage() {
        this._container = new ThreeMeshUI.Block({
            height: 1,
            width: 1.5,
            backgroundColor: UI_BACKGROUND_COLOR,
            backgroundOpacity: UI_BACKGROUND_OPACITY,
        });
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Password',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.8,
        });
        this._container.add(titleBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        this._interactables.push(interactable);
    }

    _addPageContent(backFunc) {
        this._passwordField = new PasswordTextField({
            'text': "type password here...",
            'fontSize': 0.08,
            'height': 0.2,
            'width': 0.9,
            'onEnter': () => { this._login(); },
        });
        this._loginButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Login",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.4,
        });
        let loginInteractable = new PointerInteractable(this._loginButton,
            () => { this._login(); });
        this._backButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Back",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.4,
        });
        let backInteractable = new PointerInteractable(this._backButton,
            () => { this._reset(); backFunc(); });
        this._wrongPasswordMessage = ThreeMeshUIHelper.createTextBlock({
            'text': 'Incorrect Password',
            'fontColor': new THREE.Color(0x9c0006),
            'backgroundColor': new THREE.Color(0xffc7ce),
            'backgroundOpacity': 0.7,
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.8,
            'margin': 0.04
        });
        this._wrongPasswordMessage.visible = false;
        this._container.add(this._passwordField.block);
        this._container.add(this._wrongPasswordMessage);
        this._container.add(this._loginButton);
        this._container.add(this._backButton);
        this._interactables.push(this._passwordField.interactable);
        this._interactables.push(loginInteractable);
        this._interactables.push(backInteractable);
    }

    _reset() {
        this._wrongPasswordMessage.visible = false;
        this._passwordField.reset();
    }

    _login() {
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._loginButton.visible = false;
        this._backButton.visible = false;
        this._wrongPasswordMessage.visible = false;
        let request = { 'id': this._account._id, 'password': this._passwordField.content };
        $.ajax({
            url: global.API_URL + '/login',
            data: JSON.stringify(request),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                global.jwt = response.data.jwt;
                this._loginButton.visible = true;
                this._backButton.visible = true;
                global.pointerInteractableManager.addInteractables(this._interactables);
                global.changeScene(SceneNames.HOME);
            },
            error: (xhr, status, error) => {
                this._loginButton.visible = true;
                this._backButton.visible = true;
                this._wrongPasswordMessage.visible = true;
                global.pointerInteractableManager.addInteractables(this._interactables);
            }
        });
    }

    setAccount(account) {
        this._account = account;
    }

    addToScene(scene) {
        scene.add(this._container);
        global.pointerInteractableManager.addInteractables(this._interactables);
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default PasswordEntryPage;
