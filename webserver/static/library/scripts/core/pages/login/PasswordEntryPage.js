import SceneNames from '/library/scripts/core/enums/SceneNames.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
import global from '/library/scripts/core/resources/global.js';
import ValidKeys from '/library/scripts/core/resources/ValidKeys.js';

import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';

class PasswordEntryPage {
    constructor(backFunc) {
        this._interactables = [];
        this._password = "";
        this._setupEventListeners();
        this._createPage();
        this._addPageContent(backFunc);
    }

    _setupEventListeners() {
        this._keyListener = (event) => {
            if(ValidKeys.has(event.key)) {
                this._appendToPasswordContent(event.key);
            } else if(event.key == "Backspace") {
                this._removeFromEndOfPasswordContent();
            } else if(event.key == "Enter") {
                this._deactivate();
                this._login();
            }
        };
        this._clickListener = (event) => {
            this._deactivate();
        };
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
        this._passwordBlock = ThreeMeshUIHelper.createButtonBlock({
            'text': "type password here...",
            'fontSize': 0.08,
            'height': 0.2,
            'width': 0.9,
        });
        let passwordInteractable = new PointerInteractable(this._passwordBlock,
            () => { this._activate(); });
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
        this._container.add(this._passwordBlock);
        this._container.add(this._wrongPasswordMessage);
        this._container.add(this._loginButton);
        this._container.add(this._backButton);
        this._interactables.push(passwordInteractable);
        this._interactables.push(loginInteractable);
        this._interactables.push(backInteractable);
    }

    _appendToPasswordContent(str) {
        this._password += str;
        this._updateDisplayedPasswordWithCursor();
    }

    _removeFromEndOfPasswordContent() {
        if(this._password.length > 0) {
            this._password = this._password.slice(0, -1);
            this._updateDisplayedPasswordWithCursor();
        }
    }

    _updateDisplayedPasswordWithCursor() {
        let displayedPassword = "*".repeat(this._password.length) + "|";
        let textComponent = this._passwordBlock.children[1];
        textComponent.set({ content: displayedPassword });
    }

    _removeCursor() {
        let textComponent = this._passwordBlock.children[1];
        let content = textComponent.content;
        if(content.length > 0 && content.endsWith("|")) {
            let newContent = textComponent.content.slice(0,-1);
            textComponent.set({ content: newContent });
        }
    }

    _activate() {
        let textComponent = this._passwordBlock.children[1];
        if(textComponent.content.endsWith("|")) {
            return;
        } else if(textComponent.content == "type password here...") {
            this._password = "";
            textComponent.set({ content: "|" });
        } else {
            textComponent.set({ content: textComponent.content + "|" });
        }
        if(global.deviceType == "XR") {
            //TODO: Add XR functionality for _activate()
            console.warn("TODO: Add XR functionality for _activate()");
        } else if(global.deviceType == "POINTER") {
            document.addEventListener("keydown", this._keyListener);
            document.addEventListener("click", this._clickListener);
            global.keyboardLock = true;
        } else if (global.deviceType == "MOBILE") {
            //TODO: Add Mobile functionality for _activate()
            console.warn("TODO: Add Mobile functionality for _activate()");
        }
    }

    _deactivate() {
        if(global.deviceType == "XR") {
            //TODO: Add XR functionality for _deactivate()
            console.warn("TODO: Add XR functionality for _deactivate()");
        } else if(global.deviceType == "POINTER") {
            document.removeEventListener("keydown", this._keyListener);
            document.removeEventListener("click", this._clickListener);
            global.keyboardLock = false;
            this._removeCursor();
        } else if (global.deviceType == "MOBILE") {
            //TODO: Add Mobile functionality for _deactivate()
            console.warn("TODO: Add Mobile functionality for _deactivate()");
        }
    }

    _reset() {
        this._deactivate();
        this._wrongPasswordMessage.visible = false;
        let textComponent = this._passwordBlock.children[1];
        textComponent.set({ content: "type password here..." });
    }

    _login() {
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._loginButton.visible = false;
        this._backButton.visible = false;
        this._wrongPasswordMessage.visible = false;
        let request = { 'id': this._account._id, 'password': this._password };
        $.ajax({
            url: global.API_URL + '/login',
            data: JSON.stringify(request),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                global.jwt = response.data;
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
