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
        "userFriendlyName": "Browse All",
        "pageId": HomeSceneMenus.LIBRARY_RESULTS
    }, {
        "userFriendlyName": "Tags",
        "pageId": HomeSceneMenus.LIBRARY_TAGS
    }, {
        "userFriendlyName": "Search",
        "pageId": HomeSceneMenus.LIBRARY_SEARCH
    }];

class LibraryPage2 {
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
            'text': 'Library',
            'fontSize': 0.1,
            'height': 0.2,
            'width': 0.5,
            'margin': 0.07,
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

        let interactable = new PointerInteractable(this._container.children[0]);
        let backInteractable = new PointerInteractable(backButton, () => {
            this._controller.back();
        });
        this._interactables.push(interactable);
        this._interactables.push(backInteractable);
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
                console.log("TODO: Go to " + links[i].pageId + " for " + this._assetType);
                let page = this._controller.getPage(links[i].pageId);
                if(links[i].pageId == HomeSceneMenus.LIBRARY_RESULTS) {
                    console.log("TODO: set asset list appropriately");
                    page.loadData(global.user.library.assets);
                } else if(links[i].pageId == HomeSceneMenus.LIBRARY_TAGS) {
                    console.log("TODO: set tag list appropriately");
                    page.setTagList([]);
                } else if(links[i].pageId == HomeSceneMenus.LIBRARY_SEARCH) {
                    page.setAssetType(this._assetType);
                }
                this._controller.goToPage(links[i].pageId);
            });
            this._interactables.push(interactable);
        }
        this._container.add(columnBlock);
    }

    setAssetType(assetType) {
        this._assetType = assetType;
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

export default LibraryPage2;
