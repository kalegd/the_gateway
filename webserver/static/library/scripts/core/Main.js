import LoginSceneController from '/library/scripts/core/scenes/LoginSceneController.js';
import HomeSceneController from '/library/scripts/core/scenes/HomeSceneController.js';
import UserController from '/library/scripts/core/assets/UserController.js';
import PointerInteractableManager from '/library/scripts/core/interaction/PointerInteractableManager.js';
import Background from '/library/scripts/core/resources/Background.js';
import SceneNames from '/library/scripts/core/enums/SceneNames.js';

import InputHandler from '/library/scripts/core/handlers/InputHandler.js';
import SessionHandler from '/library/scripts/core/handlers/SessionHandler.js';
import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import * as THREE from '/library/scripts/three/build/three.module.js';
import Stats from '/library/scripts/three/stats.module.js';

export default class Main {
    constructor() {
        this._renderer;
        this._scene;
        this._camera;
        this._clock = new THREE.Clock();
        this._container = document.getElementById('container');
        this._loadingMessage = document.querySelector('#loading');
        this._dynamicAssets = [];
        global.loadingAssets = new Set();
        global.changeScene = (sceneName) => { this.changeScene(sceneName) };

        this._createRenderer();
        this._createScene();
        this._createUser();
        this._createHandlers();
        this._createAssets();
        this._addEventListeners();
        this._enableStats();

        this._renderer.setAnimationLoop(() => { this._loading() });
    }

    _createRenderer() {
        this._renderer = new THREE.WebGLRenderer({ antialias : true });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._container.appendChild(this._renderer.domElement);
        if(global.deviceType == "XR") {
            this._renderer.xr.enabled = true;
        }
        global.renderer = this._renderer;
    }

    _createScene() {
        this._scene = new THREE.Scene();
        global.scene = this._scene;
    }

    _createUser() {
        this._userObj = new THREE.Object3D();
        this._cameraFocus = new THREE.Object3D();
        this._camera = new THREE.PerspectiveCamera(
            45, //Field of View Angle
            window.innerWidth / window.innerHeight, //Aspect Ratio
            0.1, //Clipping for things closer than this amount
            1000 //Clipping for things farther than this amount
        );
        if(global.deviceType != "XR") {
            //this._cameraFocus.position.setY(1.7); //Height of your eyes
            this._camera.position.setY(0.8);
            this._camera.position.setZ(-1.9);
        }
        this._cameraFocus.add(this._camera);
        this._userObj.add(this._cameraFocus);
        this._scene.add(this._userObj);
        global.camera = this._camera;
        global.cameraFocus = this._cameraFocus;
    }

    _createHandlers() {
        this._sessionHandler = new SessionHandler();
        this._inputHandler = new InputHandler(this._renderer, this._userObj);
        this._pointerInteractableManager = new PointerInteractableManager();
        global.sessionHandler = this._sessionHandler;
        global.inputHandler = this._inputHandler;
        global.pointerInteractableManager = this._pointerInteractableManager;
    }

    _createAssets() {
        Background.setToSkybox({
            "Path": "/library/backgrounds/space_compressed/",
            "File Extension": ".jpg"
        });

        this._sceneController = new LoginSceneController();
        this._userController = new UserController({
            'User Object': this._userObj,
        });

        this._sceneController.addToScene(this._scene);
        this._userController.addToScene();
    }

    _addEventListeners() {
        window.addEventListener('resize', () => { this._onResize() });
        window.addEventListener('wheel', function(event) {
                    event.preventDefault();
        }, {passive: false, capture: true});
        
    }

    _onResize() {
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
    }

    _enableStats() {
        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);
    }

    _loading() {
        if(global.loadingAssets.size == 0) {
            $(this._loadingMessage).removeClass("loading");
            this._sessionHandler.displayButton();
            if(global.deviceType == "XR") {
                this._sessionHandler.displayButton();
                this._renderer.setAnimationLoop((time, frame) => {
                    this._inputHandler.update(frame);
                    this._update();
                });
            } else if (global.deviceType == "POINTER") {
                this._renderer.setAnimationLoop(() => {
                    //this._sessionHandler.update();
                    this._update();
                });
            } else if (global.deviceType == "MOBILE") {
                this._renderer.setAnimationLoop(() => {
                    //this._sessionHandler.update();
                    this._update();
                });
            }
            setTimeout(() => {
                global.physicsScene.setGravity({x:0,y:-9.8,z:0});
                for(let i = 0; i < this._dynamicAssets.length; i++) {
                    if("wakeUp" in this._dynamicAssets[i]) {
                        this._dynamicAssets[i].wakeUp();
                    }
                }
            }, 2000);
        } else {
            $(this._loadingMessage).html("<h2>Loading "
                + global.loadingAssets.size + " more asset(s)</h2>");
        }
    }

    _update() {
        this._stats.begin();
        let timeDelta = this._clock.getDelta();
        global.physicsScene.simulate(timeDelta, true);
        global.physicsScene.fetchResults(true);
        this._userController.update(timeDelta);
        this._sceneController.update(timeDelta);
        this._renderer.render(this._scene, this._camera);
        this._stats.end();
    }

    changeScene(sceneName) {
        if(sceneName == SceneNames.LOGIN) {
            this._sceneController.removeFromScene();
            this._sceneController = new LoginSceneController();
            this._sceneController.addToScene(this._scene);
            Background.setToSkybox({
                "Path": "/library/backgrounds/space_compressed/",
                "File Extension": ".jpg"
            });
        } else if(sceneName == SceneNames.HOME) {
            Background.setToSkybox({
                "Path": "/library/backgrounds/blue_sky_compressed/",
                "File Extension": ".jpg"
            });
            this._sceneController.removeFromScene();
            this._sceneController = new HomeSceneController();
            this._sceneController.addToScene(this._scene);
        }
    }
}
