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
        
        let interactable = new PointerInteractable(this._container.children[0]);
        this._interactables.push(interactable);
    }

    _addPageContent(accounts, selectFunc, previousPageFunc, nextPageFunc) {
        let menuButton = ThreeMeshUIHelper.createButtonBlock({
            'text': 'Click Me!!',
            'fontSize': 0.2,
            'height': 0.6,
            'width': 1.2,
            //'ontrigger': () => { alert("Menu Button Clicked"); },
        });
        let menuInteractable = new PointerInteractable(menuButton, () => {
            alert("Menu Button Clicked");
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

export default TestPage;
