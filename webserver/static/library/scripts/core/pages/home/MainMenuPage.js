import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import {
    FONT_FAMILY,
    FONT_TEXTURE,
    UI_BACKGROUND_COLOR,
    UI_BACKGROUND_OPACITY
} from '/library/scripts/core/resources/constants.js';

let links = [{
        "userFriendlyName": "Hands",
        "pageId": HomeSceneMenus.HANDS
    }, {
        "userFriendlyName": "Library",
        "pageId": HomeSceneMenus.LIBRARY
    }, {
        "userFriendlyName": "Discover New Assets",
        "pageId": HomeSceneMenus.DISCOVER
    }, {
        "userFriendlyName": "Connected Websites",
        "pageId": HomeSceneMenus.CONNECTED_WEBSITES
    }, {
        "userFriendlyName": "Settings",
        "pageId": HomeSceneMenus.SETTINGS
    }];

class MainMenuPage {
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
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': 'Menu',
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

    _addPageContent() {
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1.2,
            'contentDirection': 'column',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
        });
        for(let i = 0; i < links.length; i++) {
            let linkButton = ThreeMeshUIHelper.createButtonBlock({
                'text': links[i].userFriendlyName,
                'fontSize': 0.08,
                'height': 0.1,
                'width': 1,
            });
            columnBlock.add(linkButton);
            let interactable = new PointerInteractable(linkButton, () => {
                this._controller.goToPage(links[i].pageId);
            });
            this._interactables.push(interactable);
        }
        this._container.add(columnBlock);
    }

    addToScene(scene) {
        if(scene) {
            scene.add(this._container);
            global.pointerInteractableManager.addInteractables(this._interactables);
        }
    }

    removeFromScene() {
        if(this._container.parent) {
            this._container.parent.remove(this._container);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default MainMenuPage;
