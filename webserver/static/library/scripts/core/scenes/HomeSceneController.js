import AmbientLight from '/library/scripts/core/assets/AmbientLight.js';
import PointLight from '/library/scripts/core/assets/PointLight.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import TitleAndButtonPage from '/library/scripts/core/pages/TitleAndButtonPage.js';
import global from '/library/scripts/core/resources/global.js';
import { fullDispose } from '/library/scripts/core/resources/utils.module.js';

import * as THREE from '/library/scripts/three/build/three.module.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
  
export default class HomeSceneController {
    constructor() {
        this._pivotPoint = new THREE.Object3D();

        this._fetchUserInfo();
        this._createMeshes();
    }

    _fetchUserInfo() {
        $.ajax({
            url: '/user',
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                global.user = response.data;
                console.log(global.user);
                this._fetchUserAssets();
            },
            error: (xhr, status, error) => {
                if(!this._userInfoErrorPage) {
                    this._userInfoErrorPage = new TitleAndButtonPage({
                        'Title': 'Error connecting to your Gateway Server',
                        'Button Text': 'Try Again',
                        'Button Function': () => {
                            this._userInfoErrorPage.removeFromScene();
                            this._fetchUserInfo();
                        },
                    });
                }
                this._userInfoErrorPage.addToScene(this._pivotPoint);
            }
        });
    }

    _fetchUserAssets() {
        $.ajax({
            url: '/assets',
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", global.jwt);
            },
            success: (response) => {
                global.assets = response.data;
                console.log(global.assets);
                console.warn("TODO: Build scene from user assets information");
            },
            error: (xhr, status, error) => {
                if(!this._userAssetsErrorPage) {
                    this._userAssetsErrorPage = new TitleAndButtonPage({
                        'Title': 'Error connecting to your Gateway Server',
                        'Button Text': 'Try Again',
                        'Button Function': () => {
                            this._userAssetsErrorPage.removeFromScene();
                            this._fetchUserAssets();
                        },
                    });
                }
                this._userAssetsErrorPage.addToScene(this._pivotPoint);
            }
        });
    }

    _createMeshes() {
        let pointLight = new PointLight({ "Position": [1000,2,0] });
        let pointLight2 = new PointLight({ "Position": [-10,200,-10] });
        let ambientLight = new AmbientLight({ "Intensity": 0.5 });
        pointLight.addToScene(this._pivotPoint);
        pointLight2.addToScene(this._pivotPoint);
        ambientLight.addToScene(this._pivotPoint);

        let geometry = new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 );
        let material = new THREE.MeshStandardMaterial( {color: 0x00ff00} );
        let cube = new THREE.Mesh( geometry, material );
        this._pivotPoint.add(cube);

        //let testPage = new TestPage();
        //testPage.addToScene(this._pivotPoint);
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
        global.pointerInteractableManager.update();
    }

    static getFields() {
        return [];
    }

}
