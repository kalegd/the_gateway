import HomeSceneMenus from '/library/scripts/core/enums/HomeSceneMenus.js';
import MainMenuPage from '/library/scripts/core/pages/home/MainMenuPage.js';
import HandsPage from '/library/scripts/core/pages/home/HandsPage.js';
import LibraryPage from '/library/scripts/core/pages/home/LibraryPage.js';
import LibraryPage2 from '/library/scripts/core/pages/home/LibraryPage2.js';
import LibraryListPage from '/library/scripts/core/pages/home/LibraryListPage.js';
import LibraryTagsPage from '/library/scripts/core/pages/home/LibraryTagsPage.js';
import LibrarySearchPage from '/library/scripts/core/pages/home/LibrarySearchPage.js';
import ConnectedWebsitesPage from '/library/scripts/core/pages/home/ConnectedWebsitesPage.js';
import DiscoverPage from '/library/scripts/core/pages/home/DiscoverPage.js';
import SettingsPage from '/library/scripts/core/pages/home/SettingsPage.js';

class MenuController {
    constructor() {
        this._pages = {};
        this._pages[HomeSceneMenus.MAIN] = new MainMenuPage(this);
        this._pages[HomeSceneMenus.HANDS] = new HandsPage(this);
        this._pages[HomeSceneMenus.LIBRARY] = new LibraryPage(this);
        this._pages[HomeSceneMenus.LIBRARY2] = new LibraryPage2(this);
        this._pages[HomeSceneMenus.LIBRARY_LIST] = new LibraryListPage(this);
        this._pages[HomeSceneMenus.LIBRARY_TAGS] = new LibraryTagsPage(this);
        this._pages[HomeSceneMenus.LIBRARY_SEARCH] = new LibrarySearchPage(this);
        this._pages[HomeSceneMenus.CONNECTED_WEBSITES] = new ConnectedWebsitesPage(this);
        this._pages[HomeSceneMenus.DISCOVER] = new DiscoverPage(this);
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

    back() {
        let currentPage = this._getCurrentPage();
        currentPage.removeFromScene();
        this._pageCalls.pop();
        currentPage = this._getCurrentPage();
        currentPage.addToScene(this._scene);
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
