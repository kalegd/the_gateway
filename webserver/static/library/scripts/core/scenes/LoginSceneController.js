import SimpleMenuController from '/library/scripts/components/menu/SimpleMenuController.js';

import AmbientLight from '/library/scripts/core/assets/AmbientLight.js';
import PointLight from '/library/scripts/core/assets/PointLight.js';
import SceneNames from '/library/scripts/core/enums/SceneNames.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
//import TestPage from '/library/scripts/core/pages/TestPage.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
import global from '/library/scripts/core/resources/global.js';
import ValidKeys from '/library/scripts/core/resources/ValidKeys.js';
import { fullDispose } from '/library/scripts/core/resources/utils.module.js';

import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
  
export default class LoginSceneController {
    constructor() {
        this._pivotPoint = new THREE.Object3D();
        this._menuController = new AccountsMenuController(this._pivotPoint);

        this._createMeshes();
        this._fetchUsers();
    }

    _createMeshes() {
        let pointLight = new PointLight({ "Position": [1000,2,0] });
        let pointLight2 = new PointLight({ "Position": [-10,200,-10] });
        let ambientLight = new AmbientLight({ "Intensity": 0.5 });
        pointLight.addToScene(this._pivotPoint);
        pointLight2.addToScene(this._pivotPoint);
        ambientLight.addToScene(this._pivotPoint);

        //let geometry = new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 );
        //let material = new THREE.MeshStandardMaterial( {color: 0x00ff00} );
        //let cube = new THREE.Mesh( geometry, material );
        //this._pivotPoint.add(cube);

        //let testPage = new TestPage();
        //testPage.addToScene(this._pivotPoint);
    }

    _fetchUsers() {
        $.ajax({
            url: global.API_URL + '/users',
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                let users = response.data;
                this._initMenu(users);
            },
            error: (xhr, status, error) => {
                this._initNetworkErrorMenu();
            }
        });
    }

    _initMenu(users) {
        let selectFunc = (account) => {
            if(account.isPasswordProtected) {
                this._menuController.goToPasswordPageFor(account);
            }
        };
        for(let i = 0; i < users.length; i += 5) {
            let nextPageFunc = null;
            let previousPageFunc = null;
            if(i+5 < users.length) {
                nextPageFunc = () => this._menuController.nextPage();
            }
            if(i != 0) {
                previousPageFunc = () => this._menuController.previousPage();
            }
            let menuPage = new AccountsMenuPage(
                users.slice(i, i + 5),
                selectFunc,
                previousPageFunc,
                nextPageFunc,
            );
            this._menuController.addPage(menuPage);
            if(i == 0) {
                menuPage.addToScene(this._pivotPoint);
            }
        }
    }

    _initNetworkErrorMenu() {
        let errorPage = new NetworkErrorPage();
        this._menuController.addPage(errorPage);
        errorPage.addToScene(this._pivotPoint);
    }

    addToScene(scene) {
        scene.add(this._pivotPoint);
    }

    removeFromScene() {
        global.pointerInteractableManager.reset();
        this._pivotPoint.parent.remove(this._pivotPoint);
        fullDispose(this._pivotPoint);
    }

    canUpdate() {
        return true;
    }

    update(timeDelta) {
        ThreeMeshUI.update();
        global.pointerInteractableManager.update();
    }

    static getFields() {
        return [];
    }

}

class AccountsMenuController extends SimpleMenuController {
    constructor(scene) {
        super(scene);

        this._passwordPage = new PasswordEntryPage(() => {
            this._passwordPage.removeFromScene();
            this._pages[this._pageIndex].addToScene(this._scene);
            this._passwordPageActive = false;
        });
        this._passwordPageActive = false;
    }

    addPage(page) {
        super.addPage(page);
    }

    nextPage() {
        super.nextPage();
    }

    previousPage() {
        super.previousPage();
    }

    goToPasswordPageFor(account) {
        this._pages[this._pageIndex].removeFromScene();
        this._passwordPage.addToScene(this._scene);
        this._passwordPage.setAccount(account);
        this._passwordPageActive = true;
    }
}

class NetworkErrorPage {
    constructor() {
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
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': "Could not connect to your Gateway Server",
            'fontSize': 0.1,
            'height': 0.4,
            'width': 1.2,
        });
        this._container.add(titleBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        this._interactables.push(interactable);
    }

    _addPageContent() {
        let menuButton = ThreeMeshUIHelper.createButtonBlock({
            'text': 'Refresh Page',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.6,
        });
        let menuInteractable = new PointerInteractable(menuButton, () => {
            location.reload();
        });
        this._container.add(menuButton);
        this._interactables.push(menuInteractable);
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

class AccountsMenuPage {
    constructor(accounts, selectFunc, previousPage, nextPage) {
        this._interactables = [];
        this._createPage();
        this._addPageContent(accounts, selectFunc, previousPage, nextPage);
        this._waitingOnRequest = false;
    }

    _createPage() {
        this._container = new ThreeMeshUI.Block({
            height: 1,
            width: 1.5,
            backgroundColor: UI_BACKGROUND_COLOR,
            backgroundOpacity: UI_BACKGROUND_OPACITY,
        }); 
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Accounts',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
        });
        this._container.add(titleBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        this._interactables.push(interactable);
    }

    _addPageContent(accounts, selectFunc, previousPageFunc, nextPageFunc) {
        let rowBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
            'margin': 0.02,
        });
        let previousPage;
        if(previousPageFunc) {
            previousPage = ThreeMeshUIHelper.createButtonBlock({
                'text': '<',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
            let interactable = new PointerInteractable(previousPage,
                                                       previousPageFunc);
            this._interactables.push(interactable);
        } else {
            previousPage = ThreeMeshUIHelper.createTextBlock({
                'text': ' ',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
        }
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 0.9,
            'contentDirection': 'column',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
            'margin': 0.02,
        });
        for(let i = 0; i < accounts.length; i++) {
            let account = ThreeMeshUIHelper.createButtonBlock({
                'text': accounts[i].name,
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.6,
            });
            columnBlock.add(account);
            let interactable = new PointerInteractable(account, () => {
                (accounts[i].isPasswordProtected)
                    ? selectFunc(accounts[i])
                    : this._login(accounts[i]);
            });
            this._interactables.push(interactable);
        }
        let nextPage;
        if(nextPageFunc) {
            nextPage = ThreeMeshUIHelper.createButtonBlock({
                'text': '>',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
            let interactable = new PointerInteractable(nextPage,
                                                       nextPageFunc);
            this._interactables.push(interactable);
        } else {
            nextPage = ThreeMeshUIHelper.createTextBlock({
                'text': ' ',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
        }
        rowBlock.add(previousPage);
        rowBlock.add(columnBlock);
        rowBlock.add(nextPage);
        this._container.add(rowBlock);
    }

    _login(account) {
        this._waitingOnRequest = true;
        this._container.visible = false;
        let request = { 'id': account._id };
        $.ajax({
            url: global.API_URL + '/login',
            data: JSON.stringify(request),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                global.jwt = response.data;
                this._waitingOnRequest = false;
                this._container.visible = true;
                global.changeScene(SceneNames.HOME);
            },
            error: (xhr, status, error) => {
                this._waitingOnRequest = false;
                this._container.visible = true;
                //TODO: Make better UX. This is dirty
                alert("Sorry, there was an issue connecting to The Gateway server. Please try again later");
            }
        });
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
