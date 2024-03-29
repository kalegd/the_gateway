import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import MainMenuPage from '/library/scripts/core/pages/home/MainMenuPage.js';
import HandsPage from '/library/scripts/core/pages/home/HandsPage.js';
import LibraryPage from '/library/scripts/core/pages/home/LibraryPage.js';
import LibraryPage2 from '/library/scripts/core/pages/home/LibraryPage2.js';
import LibraryResultsPage from '/library/scripts/core/pages/home/LibraryResultsPage.js';
import LibraryTagsPage from '/library/scripts/core/pages/home/LibraryTagsPage.js';
import LibrarySearchPage from '/library/scripts/core/pages/home/LibrarySearchPage.js';
import LibraryModelPage from '/library/scripts/core/pages/home/LibraryModelPage.js';
import WebworldPage from '/library/scripts/core/pages/home/WebworldPage.js';
import WebworldsPage from '/library/scripts/core/pages/home/WebworldsPage.js';
import WebworldAssetsPage from '/library/scripts/core/pages/home/WebworldAssetsPage.js';
import WebworldAssetPage from '/library/scripts/core/pages/home/WebworldAssetPage.js';
import WebworldInstancePage from '/library/scripts/core/pages/home/WebworldInstancePage.js';
import WebworldTagsPage from '/library/scripts/core/pages/home/WebworldTagsPage.js';
import WebworldSearchPage from '/library/scripts/core/pages/home/WebworldSearchPage.js';
import WebworldResultsPage from '/library/scripts/core/pages/home/WebworldResultsPage.js';
import NewWebworldPage from '/library/scripts/core/pages/home/NewWebworldPage.js';
import DiscoverPage from '/library/scripts/core/pages/home/DiscoverPage.js';
import SketchfabNeedTokenPage from '/library/scripts/core/pages/home/SketchfabNeedTokenPage.js';
import SketchfabSearchPage from '/library/scripts/core/pages/home/SketchfabSearchPage.js';
import SketchfabResultsPage from '/library/scripts/core/pages/home/SketchfabResultsPage.js';
import SketchfabModelPage from '/library/scripts/core/pages/home/SketchfabModelPage.js';
import SettingsPage from '/library/scripts/core/pages/home/SettingsPage.js';

class MenuController {
    constructor() {
        this._pages = {};
        this._pages[HomeSceneMenus.MAIN] = new MainMenuPage(this);
        this._pages[HomeSceneMenus.HANDS] = new HandsPage(this);
        this._pages[HomeSceneMenus.LIBRARY] = new LibraryPage(this);
        this._pages[HomeSceneMenus.LIBRARY2] = new LibraryPage2(this);
        this._pages[HomeSceneMenus.LIBRARY_RESULTS] = new LibraryResultsPage(this);
        this._pages[HomeSceneMenus.LIBRARY_TAGS] = new LibraryTagsPage(this);
        this._pages[HomeSceneMenus.LIBRARY_SEARCH] = new LibrarySearchPage(this);
        this._pages[HomeSceneMenus.LIBRARY_MODEL] = new LibraryModelPage(this);
        this._pages[HomeSceneMenus.WEBWORLD] = new WebworldPage(this);
        this._pages[HomeSceneMenus.WEBWORLDS] = new WebworldsPage(this);
        this._pages[HomeSceneMenus.WEBWORLD_ASSETS] = new WebworldAssetsPage(this);
        this._pages[HomeSceneMenus.WEBWORLD_ASSET] = new WebworldAssetPage(this);
        this._pages[HomeSceneMenus.WEBWORLD_INSTANCE] = new WebworldInstancePage(this);
        this._pages[HomeSceneMenus.WEBWORLD_TAGS] = new WebworldTagsPage(this);
        this._pages[HomeSceneMenus.WEBWORLD_SEARCH] = new WebworldSearchPage(this);
        this._pages[HomeSceneMenus.WEBWORLD_RESULTS] = new WebworldResultsPage(this);
        this._pages[HomeSceneMenus.NEW_WEBWORLD] = new NewWebworldPage(this);
        this._pages[HomeSceneMenus.DISCOVER] = new DiscoverPage(this);
        this._pages[HomeSceneMenus.SKETCHFAB_NEED_TOKEN] = new SketchfabNeedTokenPage(this);
        this._pages[HomeSceneMenus.SKETCHFAB_SEARCH] = new SketchfabSearchPage(this);
        this._pages[HomeSceneMenus.SKETCHFAB_RESULTS] = new SketchfabResultsPage(this);
        this._pages[HomeSceneMenus.SKETCHFAB_MODEL] = new SketchfabModelPage(this);
        this._pages[HomeSceneMenus.SETTINGS] = new SettingsPage(this);
        this._pageCalls = [HomeSceneMenus.MAIN];
    }

    _getCurrentPage() {
        return this._pages[this._pageCalls[this._pageCalls.length-1]];
    }

    getPage(page) {
        return this._pages[page];
    }

    goToPage(page) {
        let currentPage = this._getCurrentPage();
        currentPage.removeFromScene();
        this._pageCalls.push(page);
        this._pages[page].addToScene(this._scene);
    }

    back(skip = 0) {
        let currentPage = this._getCurrentPage();
        currentPage.removeFromScene();
        if(currentPage.cleanup) {
            currentPage.cleanup();
        }
        for(let i = 0; i < skip + 1; i++) this._pageCalls.pop();
        currentPage = this._getCurrentPage();
        currentPage.addToScene(this._scene);
    }

    goToPageFromRoot(page) {
        let currentPage = this._getCurrentPage();
        currentPage.removeFromScene();
        while(this._pageCalls.length > 1) {
            let page = this._pages[this._pageCalls.pop()];
            if(page.cleanup) {
                page.cleanup();
            }
        }
        this._pageCalls.push(page);
        this._pages[page].addToScene(this._scene);
    }

    addToScene(scene) {
        this._scene = scene;
        this._getCurrentPage().addToScene(scene);
    }

    removeFromScene() {
        this._getCurrentPage.removeFromScene();
    }
}

export default MenuController;
