import global from '/library/scripts/core/resources/global.js';

class WebworldController {
    constructor() {
        this._webworld;
    }

    setWebworld(webworld) {
        this.clearWebworld();
        this._webworld = webworld;
        console.log("TODO: add assets for webworld");
        global.activeWebworld = webworld._id;
    }

    clearWebworld() {
        global.activeWebworld = null;
        console.log("TODO: clear current webworld assets");
    }
}

let webworldController = new WebworldController();

export default webworldController;
