import SceneNames from '/library/scripts/core/enums/SceneNames.js';
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

class AccountsMenuPage {
    constructor(accounts, selectFunc, previousPage, nextPage) {
        this._interactables = [];
        this._createPage();
        this._addPageContent(accounts, selectFunc, previousPage, nextPage);
        this._waitingOnRequest = false;
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
        this._container.position.setZ(2);

        let interactable = new PointerInteractable(this._container.children[0]);
        this._interactables.push(interactable);
    }

    _addPageContent(accounts, selectFunc, previousPageFunc, nextPageFunc) {
        let rowBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 1,
            'contentDirection': 'row',
            'justifyContent': 'center',
            'backgroundOpacity': 0,
        });
        let previousPage;
        if(previousPageFunc) {
            previousPage = ThreeMeshUIHelper.createButtonBlock({
                'text': '<',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
            let interactable = new PointerInteractable(previousPage,
                                                       previousPageFunc);
            this._interactables.push(interactable);
        } else {
            previousPage = ThreeMeshUIHelper.createTextBlock({
                'text': ' ',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
        }
        let columnBlock = new ThreeMeshUI.Block({
            'height': 0.8,
            'width': 0.9,
            'contentDirection': 'column',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
        });
        for(let i = 0; i < accounts.length; i++) {
            let account = ThreeMeshUIHelper.createButtonBlock({
                'text': accounts[i].name,
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.6,
            });
            columnBlock.add(account);
            let interactable = new PointerInteractable(account, () => {
                (accounts[i].isPasswordProtected)
                    ? selectFunc(accounts[i])
                    : this._login(accounts[i]);
            });
            this._interactables.push(interactable);
        }
        let nextPage;
        if(nextPageFunc) {
            nextPage = ThreeMeshUIHelper.createButtonBlock({
                'text': '>',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
            let interactable = new PointerInteractable(nextPage,
                                                       nextPageFunc);
            this._interactables.push(interactable);
        } else {
            nextPage = ThreeMeshUIHelper.createTextBlock({
                'text': ' ',
                'fontSize': 0.08,
                'height': 0.1,
                'width': 0.1,
            });
        }
        rowBlock.add(previousPage);
        rowBlock.add(columnBlock);
        rowBlock.add(nextPage);
        this._container.add(rowBlock);
    }

    _login(account) {
        this._waitingOnRequest = true;
        this._container.visible = false;
        let request = { 'id': account._id };
        $.ajax({
            url: global.API_URL + '/login',
            data: JSON.stringify(request),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: (response) => {
                global.jwt = response.data;
                this._waitingOnRequest = false;
                this._container.visible = true;
                global.changeScene(SceneNames.HOME);
            },
            error: (xhr, status, error) => {
                this._waitingOnRequest = false;
                this._container.visible = true;
                //TODO: Make better UX. This is dirty
                alert("Sorry, there was an issue connecting to The Gateway server. Please try again later");
            }
        });
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

export default AccountsMenuPage;
