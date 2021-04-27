import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import WebworldController from '/library/scripts/core/resources/WebworldController.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import { uuidv4, fullDispose } from '/library/scripts/core/resources/utils.module.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';

const MAX_DISPLAYED = 5;

class WebworldAssetPage {
    constructor(controller) {
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
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Webworlds',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
            'margin': 0.07,
        });
        let newButton = ThreeMeshUIHelper.createButtonBlock({
            'text': '+',
            'fontSize': 0.1,
            'height': 0.1,
            'width': 0.3,
        });
        rowBlock.add(backButton);
        rowBlock.add(titleBlock);
        rowBlock.add(newButton);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        let newInstanceInteractable = new PointerInteractable(newButton, () => {
            this._newInstance();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
        this._interactables.push(newInstanceInteractable);
    }

    _addPageContent() {
        this._cursor = 0;
        let rowBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1.2,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1.2,
            'contentDirection': 'column',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
        });
        this._instanceButtons = [];
        this._instanceInteractables = [];
        for(let i = 0; i < MAX_DISPLAYED; i++) {
            let instanceButton = ThreeMeshUIHelper.createButtonBlock({
                'text': '',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 1,
            });
            this._instanceButtons.push(instanceButton);
            columnBlock.add(instanceButton);
            let interactable = new PointerInteractable(instanceButton, () => {
                let instanceIndex = this._cursor + i;
                let instance = this._instances[instanceIndex];
                let page = this._controller.getPage(HomeSceneMenus.WEBWORLD_INSTANCE);
                page.loadData({
                    assetId: this._assetId,
                    instance: instance,
                    webworldId: this._webworldId,
                });
                this._controller.goToPage(HomeSceneMenus.WEBWORLD_INSTANCE);
            });
            this._interactables.push(interactable);
            this._instanceInteractables.push(interactable);
        }
        this._previousButton = ThreeMeshUIHelper.createButtonBlock({
            'text': '<',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.1,
        });
        this._previousButton.visible = false;
        this._previousInteractable = new PointerInteractable(this._previousButton,
            () => { this._previousPage() });
        this._nextButton = ThreeMeshUIHelper.createButtonBlock({
            'text': '>',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.1,
        });
        this._nextButton.visible = false;
        this._nextInteractable = new PointerInteractable(this._nextButton,
            () => { this._nextPage() });
        rowBlock.add(this._previousButton);
        rowBlock.add(columnBlock)
        rowBlock.add(this._nextButton);
        this._container.add(rowBlock);
    }

    loadData(data) {
        console.log(data);
        this._assetId = data.assetId;
        this._instances = data.instances;
        this._webworldId = data.webworldId;
        this._cursor = 0;
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._updateMenu();
        global.pointerInteractableManager.addInteractables(this._interactables);
    }

    _previousPage() {
        if(this._cursor != 0) {
            this._cursor -= MAX_DISPLAYED;
            this._updateMenu();
        }
    }

    _nextPage() {
        if(this._cursor + MAX_DISPLAYED <= this._instances.length) {
            this._cursor += this._previews.length;
            this._updateMenu();
        }
    }

    _updateMenu() {
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._interactables = this._interactables.slice(0,3);

        for(let i = 0; i < MAX_DISPLAYED; i++) {
            let instanceButton = this._instanceButtons[i];
            if(this._cursor + i < this._instances.length) {
                let instanceIndex = this._cursor + i;
                let instance = this._instances[instanceIndex];
                instanceButton.children[1].set({
                    content: instance.name
                });
                instanceButton.visible = true;
                this._interactables.push(this._instanceInteractables[i]);
            } else {
                instanceButton.visible = false;
            }
        }
        if(this._cursor + MAX_DISPLAYED < this._instances.length) {
            this._nextButton.visible = true;
            this._interactables.push(this._nextInteractable);
        } else {
            this._nextButton.visible = false;
        }
        if(this._cursor != 0) {
            this._previousButton.visible = true;
            this._interactables.push(this._previousInteractable);
        } else {
            this._previousButton.visible = false;
        }

        global.pointerInteractableManager.addInteractables(this._interactables);
    }

    cleanup() {
        this._cursor = 0;
    }

    _newInstance() {
        if(this._webworldId == global.activeWebworld) {
            WebworldController.addAsset(
                global.assetsMap[this._assetId],
                () => this._updateMenu(),
                () => console.error("TODO: Let user know something went wrong")
            )
        } else {
            let instance = {
                name: "Instance",
                instanceId: uuidv4(),
                position: [0,0,0],
                rotation: [0,0,0],
                scale: [1,1,1],
            };
            this._instances.push(instance);
            this._updateMenu();
        }
    }

    addToScene(scene) {
        if(scene) {
            this._updateMenu();
            scene.add(this._container);
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
            fullDispose(this._container);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default WebworldAssetPage;
