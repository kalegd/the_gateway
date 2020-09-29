import SimpleMenuController from '/library/scripts/components/menu/SimpleMenuController.js';

import ValidKeys from '/library/scripts/core/resources/ValidKeys.js';
import AmbientLight from '/library/scripts/core/assets/AmbientLight.js';
import PointLight from '/library/scripts/core/assets/PointLight.js';
import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
  
var FONT_FAMILY = "/library/fonts/OpenSans-Regular-msdf.json";
var FONT_TEXTURE = "/library/fonts/OpenSans-Regular-msdf.png";
var UI_BACKGROUND_COLOR = new THREE.Color(0x000000);
var UI_BACKGROUND_OPACITY = 0.5;

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
                //TODO: Need to inform user we can't connect to the gateway
                //      server
                console.log("TODO: Need to inform user we can't connect to the "
                            + "gateway server");
            }
        });
    }

    _initMenu(users) {
        let selectFunc = (account) => {
            //console.log(account);
            if(account.isPasswordProtected) {
                this._menuController.goToPasswordPageFor(account);
            } else {
                //TODO: Go to the Home Screen
                console.log("TODO: Go to Home Screen");
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

    addToScene(scene) {
        scene.add(this._pivotPoint);
    }

    removeFromScene() {
        this._pivotPoint.parent.remove(this._pivotPoint);
        fullDispose(this._pivotPoint);
    }

    canUpdate() {
        return true;
    }

    update(timeDelta) {
        ThreeMeshUI.update();
        this._menuController.update();
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
        this._testPage = new TestPage();
        this._testPage.addToScene(scene);
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

    getInteractables() {
        if(this._passwordPageActive) {
            return this._passwordPage.getInteractables();
        } else if(this._pageIndex != null) {
            return this._pages[this._pageIndex].getInteractables().concat(this._testPage.getInteractables());
        }
    }

    update() {
        super.update();
    }

}

class TestPage {
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
            'text': 'Accounts',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
        });
        this._container.add(titleBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(3);
    }

    _addPageContent(accounts, selectFunc, previousPageFunc, nextPageFunc) {
        let menuButton = ThreeMeshUIHelper.createButtonBlock({
            'text': 'Click Me!!',
            'fontSize': 0.2,
            'height': 0.6,
            'width': 1.2,
            'ontrigger': () => { alert("Menu Button Clicked"); },
        });
        this._container.add(menuButton);
        this._interactables.push(menuButton);
    }

    getInteractables() {
        return this._interactables;
    }

    addToScene(scene) {
        scene.add(this._container);
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
        }
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
                'ontrigger': previousPageFunc,
            });
            this._interactables.push(previousPage);
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
                'ontrigger': () => { 
                    (accounts[i].isPasswordProtected)
                        ? selectFunc(accounts[i])
                        : this._login(accounts[i])
                },
            });
            columnBlock.add(account);
            this._interactables.push(account);
        }
        let nextPage;
        if(nextPageFunc) {
            nextPage = ThreeMeshUIHelper.createButtonBlock({
                'text': '>',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
                'ontrigger': nextPageFunc,
            });
            this._interactables.push(nextPage);
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
                let jwt = response.data;
                //TODO: Go to the Home Screen
                console.log("TODO: Go to Home Screen");
                this._waitingOnRequest = false;
                this._container.visible = true;
            },
            error: (xhr, status, error) => {
                this._waitingOnRequest = false;
                this._container.visible = true;
                //TODO: Make better UX. This is dirty
                alert("Sorry, there was an issue connecting to The Gateway server. Please try again later");
            }
        });
    }

    getInteractables() {
        return (this._waitingOnRequest) ? [] : this._interactables;
    }

    addToScene(scene) {
        scene.add(this._container);
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
        }
    }
}

class PasswordEntryPage {
    constructor(backFunc) {
        this._interactables = [];
        this._password = "";
        this._setupEventListeners();
        this._createPage();
        this._addPageContent(backFunc);
        this._waitingOnRequest = false;
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
    }

    _addPageContent(backFunc) {
        this._passwordBlock = ThreeMeshUIHelper.createButtonBlock({
            'text': "type password here...",
            'fontSize': 0.08,
            'height': 0.2,
            'width': 0.9,
            'ontrigger': () => { this._activate(); },
        });
        this._loginButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Login",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.4,
            'ontrigger': () => { this._login(); },
        });
        this._backButton = ThreeMeshUIHelper.createButtonBlock({
            'text': "Back",
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.4,
            'ontrigger': () => { this._reset(); backFunc(); },
        });
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
        this._interactables.push(this._passwordBlock);
        this._interactables.push(this._loginButton);
        this._interactables.push(this._backButton);
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
            console.log("TODO: Add XR functionality for _activate()");
        } else if(global.deviceType == "POINTER") {
            document.addEventListener("keydown", this._keyListener);
            document.addEventListener("click", this._clickListener);
            global.keyboardLock = true;
        } else if (global.deviceType == "MOBILE") {
            //TODO: Add Mobile functionality for _activate()
            console.log("TODO: Add Mobile functionality for _activate()");
        }
    }

    _deactivate() {
        if(global.deviceType == "XR") {
            //TODO: Add XR functionality for _deactivate()
            console.log("TODO: Add XR functionality for _deactivate()");
        } else if(global.deviceType == "POINTER") {
            document.removeEventListener("keydown", this._keyListener);
            document.removeEventListener("click", this._clickListener);
            global.keyboardLock = false;
            this._removeCursor();
        } else if (global.deviceType == "MOBILE") {
            //TODO: Add Mobile functionality for _deactivate()
            console.log("TODO: Add Mobile functionality for _deactivate()");
        }
    }

    _reset() {
        this._deactivate();
        this._wrongPasswordMessage.visible = false;
        let textComponent = this._passwordBlock.children[1];
        textComponent.set({ content: "type password here..." });
    }

    _login() {
        this._waitingOnRequest = true;
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
                let jwt = response.data;
                //TODO: Go to the Home Screen
                console.log("TODO: Go to Home Screen");
                this._loginButton.visible = true;
                this._backButton.visible = true;
                this._waitingOnRequest = false;
            },
            error: (xhr, status, error) => {
                this._loginButton.visible = true;
                this._backButton.visible = true;
                this._wrongPasswordMessage.visible = true;
                this._waitingOnRequest = false;
            }
        });
    }

    getInteractables() {
        return (this._waitingOnRequest) ? [] : this._interactables;
    }

    setAccount(account) {
        this._account = account;
    }

    addToScene(scene) {
        scene.add(this._container);
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
        }
    }
}
