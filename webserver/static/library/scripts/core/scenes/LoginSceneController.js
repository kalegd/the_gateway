import AmbientLight from '/library/scripts/core/assets/AmbientLight.js';
import PointLight from '/library/scripts/core/assets/PointLight.js';
import SceneNames from '/library/scripts/core/enums/SceneNames.js';
import AccountsMenuPage from '/library/scripts/core/pages/login/AccountsMenuPage.js';
import NetworkErrorPage from '/library/scripts/core/pages/login/NetworkErrorPage.js';
import PasswordEntryPage from '/library/scripts/core/pages/login/PasswordEntryPage.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
//import TestPage from '/library/scripts/core/pages/TestPage.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';
import global from '/library/scripts/core/resources/global.js';
import SimpleMenuController from '/library/scripts/core/resources/SimpleMenuController.js';
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
