import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';

class SimpleMenuController {
    constructor(scene) {
        this._scene = scene;

        this._pageIndex;
        this._pages = [];
    }

    addPage(page) {
        this._pages.push(page);
        if(!this._pageIndex) {
            this._pageIndex = 0;
        }
    }

    nextPage() {
        this._pages[this._pageIndex].removeFromScene();
        this._pageIndex++;
        this._pages[this._pageIndex].addToScene(this._scene);
    }

    previousPage() {
        this._pages[this._pageIndex].removeFromScene();
        this._pageIndex--;
        this._pages[this._pageIndex].addToScene(this._scene);
    }
}

export default SimpleMenuController;
