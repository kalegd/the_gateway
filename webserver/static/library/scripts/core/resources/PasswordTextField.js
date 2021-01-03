import global from '/library/scripts/core/resources/global.js';
import TextField from '/library/scripts/core/resources/TextField.js';

class PasswordTextField extends TextField {
    constructor(params) {
        super(params);
    }

    _updateDisplayedContentWithCursor() {
        let displayedContent = "*".repeat(this.content.length) + "|";
        let textComponent = this.block.children[1];
        textComponent.set({ content: displayedContent });
    }

    _activate() {
        let textComponent = this.block.children[1];
        if(this.content == textComponent.content + "|") {
            return;
        } else {
            let displayedContent = "*".repeat(this.content.length) + "|";
            textComponent.set({ content: displayedContent });
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
}

export default PasswordTextField;
