import AssetProviders from '/library/scripts/core/enums/AssetProviders.js';
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
let links = [{
        "userFriendlyName": "Sketchfab",
        "assetProvider": AssetProviders.SKETCHFAB
    //}, {
    //    "userFriendlyName": "Google Poly",
    //    "assetProvider": AssetProviders.GOOGLE_POLY
    }];

class LibraryPage {
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
            'text': 'Discover New Assets',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.6,
            'margin': 0.0,
        });
        let spaceBlock = ThreeMeshUIHelper.createTextBlock({
            'text': ' ',
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.3,
        });
        rowBlock.add(backButton);
        rowBlock.add(titleBlock);
        rowBlock.add(spaceBlock);
        this._container.add(rowBlock);
        this._container.set({ fontFamily: FONT_FAMILY, fontTexture: FONT_TEXTURE });
        this._container.rotateY(Math.PI);
        this._container.position.setY(0.7);
        this._container.position.setZ(2);

        this._containerInteractable = new PointerInteractable(
            this._container.children[0], null, false);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        this._interactables.push(this._containerInteractable);
        this._containerInteractable.addChild(backInteractable);
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
                if(links[i].assetProvider == AssetProviders.SKETCHFAB) {
                    if(global.user.sketchfabAPIToken) {
                        this._controller.goToPage(HomeSceneMenus.SKETCHFAB_SEARCH);
                    } else {
                        this._controller.goToPage(HomeSceneMenus.SKETCHFAB_NEED_TOKEN);
                    }
                }
            });
            this._containerInteractable.addChild(interactable);
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
            fullDispose(this._container);
        }
        global.pointerInteractableManager.removeInteractables(this._interactables);
    }
}

export default LibraryPage;
