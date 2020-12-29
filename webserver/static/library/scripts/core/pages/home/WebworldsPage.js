import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import { fullDispose } from '/library/scripts/core/resources/utils.module.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';

const MAX_DISPLAYED = 5;

class WebworldsPage {
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
            this._reset();
            this._controller.back();
        });
        let newWebworldInteractable = new PointerInteractable(newButton, () => {
            this._newWebworld();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
        this._interactables.push(newWebworldInteractable);
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
        this._webworldButtons = [];
        this._webworldInteractables = [];
        for(let i = 0; i < MAX_DISPLAYED; i++) {
            let webworldButton = ThreeMeshUIHelper.createButtonBlock({
                'text': '',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 1,
            });
            this._webworldButtons.push(webworldButton);
            columnBlock.add(webworldButton);
            let interactable = new PointerInteractable(webworldButton, () => {
                let sceneIndex = this._cursor + i;
                let scene = global.scenesMap[global.user.scenes[sceneIndex]];
                let page = this._controller.getPage(HomeSceneMenus.WEBWORLD);
                page.loadData(scene);
                this._controller.goToPage(HomeSceneMenus.WEBWORLD);
            });
            this._interactables.push(interactable);
            this._webworldInteractables.push(interactable);
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

    _previousPage() {
        if(this._cursor != 0) {
            this._cursor -= MAX_DISPLAYED;
            this._updateMenu();
        }
    }

    _nextPage() {
        if(this._cursor + MAX_DISPLAYED <= global.user.scenes.length) {
            this._cursor += this._previews.length;
            this._updateMenu();
        }
    }

    _updateMenu() {
        global.pointerInteractableManager.removeInteractables(this._interactables);
        this._interactables = this._interactables.slice(0,3);

        for(let i = 0; i < MAX_DISPLAYED; i++) {
            let webworldButton = this._webworldButtons[i];
            if(this._cursor + i < global.user.scenes.length) {
                let sceneIndex = this._cursor + i;
                let scene = global.scenesMap[global.user.scenes[sceneIndex]];
                webworldButton.children[1].set({
                    content: scene.name
                });
                webworldButton.visible = true;
                this._interactables.push(this._webworldInteractables[i]);
            } else {
                webworldButton.visible = false;
            }
        }
        if(this._cursor + MAX_DISPLAYED < global.user.scenes.length) {
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

    _reset() {
        this._cursor = 0;
    }

    _newWebworld() {
        this._controller.goToPage(HomeSceneMenus.NEW_WEBWORLD);
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

export default WebworldsPage;
