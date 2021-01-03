import PointerInteractableStates from '/library/scripts/core/enums/PointerInteractableStates.js';
import PointerInteractable from '/library/scripts/core/interaction/PointerInteractable.js';
import global from '/library/scripts/core/resources/global.js';
import ValidKeys from '/library/scripts/core/resources/ValidKeys.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';

class TextField {
    constructor(params) {
        this._setupEventListeners(params['onEnter']);
        this._defaultContent = (params['text']) ? params['text'] : "";
        this.content = "";
        this.block = ThreeMeshUIHelper.createButtonBlock(params);
        this.interactable = new PointerInteractable(this.block,
            () => { this._activate(); });
    }

    _setupEventListeners(onEnterFunc) {
        this._keyListener = (event) => {
            if(ValidKeys.has(event.key)) {
                this._appendToContent(event.key);
            } else if(event.key == "Backspace") {
                this._removeFromEndOfContent();
            } else if(event.key == "Enter") {
                this._deactivate();
                if(onEnterFunc) {
                    onEnterFunc();
                }
            }
        };
        this._clickListener = (event) => {
            if(this.interactable.getState() != PointerInteractableStates.SELECTED) {
                this._deactivate();
            }
        };
    }

    _appendToContent(str) {
        this.content += str;
        this._updateDisplayedContentWithCursor();
    }

    _removeFromEndOfContent() {
        if(this.content.length > 0) {
            this.content = this.content.slice(0, -1);
            this._updateDisplayedContentWithCursor();
        }
    }

    _updateDisplayedContentWithCursor() {
        let displayedContent = this.content + "|";
        let textComponent = this.block.children[1];
        textComponent.set({ content: displayedContent });
    }

    _removeCursor() {
        let textComponent = this.block.children[1];
        let content = textComponent.content;
        if(content.length > 0 && content.endsWith("|")) {
            let newContent = textComponent.content.slice(0,-1);
            textComponent.set({ content: newContent });
        }
    }

    _activate() {
        let textComponent = this.block.children[1];
        if(this.content == textComponent.content + "|") {
            return;
        } else {
            textComponent.set({ content: this.content + "|" });
        }
        if(global.deviceType == "XR") {
            //FF: Add XR functionality for _activate()
            console.warn("FF: Add XR functionality for _activate()");
        } else if(global.deviceType == "POINTER") {
            document.addEventListener("keydown", this._keyListener);
            document.addEventListener("click", this._clickListener);
            global.keyboardLock = true;
        } else if (global.deviceType == "MOBILE") {
            //FF: Add Mobile functionality for _activate()
            console.warn("FF: Add Mobile functionality for _activate()");
        }
    }

    _deactivate() {
        if(global.deviceType == "XR") {
            //FF: Add XR functionality for _deactivate()
            console.warn("FF: Add XR functionality for _deactivate()");
        } else if(global.deviceType == "POINTER") {
            document.removeEventListener("keydown", this._keyListener);
            document.removeEventListener("click", this._clickListener);
            global.keyboardLock = false;
            this._removeCursor();
        } else if (global.deviceType == "MOBILE") {
            //FF: Add Mobile functionality for _deactivate()
            console.warn("FF: Add Mobile functionality for _deactivate()");
        }
    }

    setContent(content) {
        this.content = content;
        let textComponent = this.block.children[1];
        textComponent.set({ content: content });
    }

    isBlank() {
        return this.content == "";
    }

    reset() {
        this.content = "";
        let textComponent = this.block.children[1];
        textComponent.set({ content: this._defaultContent });
    }
}

export default TextField;
