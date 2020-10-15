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

class TitleAndButtonPage {
    constructor(params) {
        this._title = params['Title'] || 'Title Placeholder';
        this._buttonText = params['Button Text'] || 'Button Text Placeholder';
        this._buttonFunc = params['Button Function'] || function() {};
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
            'text': this._title,
            'fontSize': 0.1,
            'height': 0.4,
            'width': 1.2,
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
        let menuButton = ThreeMeshUIHelper.createButtonBlock({
            'text': this._buttonText,
            'fontSize': 0.08,
            'height': 0.1,
            'width': 0.6,
        });
        let menuInteractable = new PointerInteractable(menuButton,
                                                       this._buttonFunc);
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

export default TitleAndButtonPage;
